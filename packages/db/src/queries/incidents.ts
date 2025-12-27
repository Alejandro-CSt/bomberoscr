import { db } from "@bomberoscr/db/index";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations
} from "@bomberoscr/db/schema";
import { aliasedTable, and, between, desc, eq, inArray, lt, ne, or } from "drizzle-orm";

export async function getLatestIncidents({
  limit,
  cursor,
  stationFilter
}: {
  limit: number;
  cursor: number | null;
  stationFilter?: string | null;
}) {
  const specificIncidentType = aliasedTable(incidentTypes, "specificIncidentType");

  // If there's a station filter, first get that station's ID
  let stationId: number | undefined = undefined;
  if (stationFilter) {
    const station = await db.query.stations.findFirst({
      where: eq(stations.stationKey, stationFilter),
      columns: { id: true }
    });
    stationId = station?.id;
  }

  let whereClause = cursor ? lt(incidents.id, cursor) : undefined;

  if (stationId) {
    const dispatchedIncidents = await db
      .select({ incidentId: dispatchedStations.incidentId })
      .from(dispatchedStations)
      .where(eq(dispatchedStations.stationId, stationId));

    const dispatchedIncidentIds = dispatchedIncidents.map((d) => d.incidentId);

    whereClause = and(
      whereClause,
      or(eq(incidents.responsibleStation, stationId), inArray(incidents.id, dispatchedIncidentIds))
    );
  }

  return await db
    .select({
      id: incidents.id,
      isOpen: incidents.isOpen,
      EEConsecutive: incidents.EEConsecutive,
      address: incidents.address,
      incidentTimestamp: incidents.incidentTimestamp,
      importantDetails: incidents.importantDetails,
      specificIncidentCode: incidents.specificIncidentCode,
      incidentType: incidentTypes.name,
      responsibleStation: stations.name,
      specificIncidentType: specificIncidentType.name,
      dispatchedVehiclesCount: db.$count(
        dispatchedVehicles,
        eq(dispatchedVehicles.incidentId, incidents.id)
      ),
      dispatchedStationsCount: db.$count(
        dispatchedStations,
        eq(dispatchedStations.incidentId, incidents.id)
      )
    })
    .from(incidents)
    .where(whereClause)
    .limit(limit + 1)
    .leftJoin(incidentTypes, eq(incidents.incidentCode, incidentTypes.incidentCode))
    .leftJoin(
      specificIncidentType,
      eq(incidents.specificIncidentCode, specificIncidentType.incidentCode)
    )
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .orderBy(desc(incidents.id));
}

export async function getIncidentsCoordinates(timeRange: "24h" | "48h" | "disabled") {
  if (timeRange === "disabled") return [];
  const hours = timeRange === "24h" ? 24 : 48;
  return await db.query.incidents.findMany({
    columns: {
      id: true,
      incidentTimestamp: true,
      latitude: true,
      longitude: true,
      importantDetails: true
    },
    where: and(
      ne(incidents.latitude, "0"),
      between(
        incidents.incidentTimestamp,
        new Date(Date.now() - 1000 * 60 * 60 * hours),
        new Date()
      )
    ),
    with: {
      incidentType: {
        columns: {
          name: true
        }
      }
    },
    orderBy: desc(incidents.id)
  });
}

export async function getDetailedIncidentById(id: number) {
  return await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    with: {
      canton: true,
      district: true,
      province: true,
      dispatchedStations: {
        columns: {
          id: true,
          attentionOnFoot: true,
          serviceTypeId: true
        },
        with: {
          station: {
            columns: {
              id: true,
              name: true,
              stationKey: true,
              address: true,
              latitude: true,
              longitude: true
            }
          }
        }
      },
      dispatchedVehicles: {
        columns: {
          incidentId: false,
          stationId: false,
          vehicleId: false
        },
        with: {
          vehicle: {
            columns: {
              id: true,
              internalNumber: true,
              class: true
            }
          },
          station: {
            columns: {
              name: true
            }
          }
        }
      },
      dispatchIncidentType: {
        columns: {
          name: true
        }
      },
      specificDispatchIncidentType: {
        columns: {
          name: true
        }
      },
      incidentType: {
        columns: {
          name: true
        }
      },
      specificIncidentType: {
        columns: {
          name: true
        }
      }
    }
  });
}

export type DetailedIncident = Awaited<ReturnType<typeof getDetailedIncidentById>>;
