import { db } from "@bomberoscr/db/index";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations
} from "@bomberoscr/db/schema";
import { aliasedTable, and, between, desc, eq, inArray, lt, ne, or, sql } from "drizzle-orm";

export async function getExistingIncidentIds(ids: number[]) {
  if (ids.length === 0) return [] as number[];
  const rows = await db
    .select({ id: incidents.id })
    .from(incidents)
    .where(inArray(incidents.id, ids));
  return rows.map((r) => r.id);
}

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

export async function getIncidentStatistics(incident: NonNullable<DetailedIncident>) {
  const year = incident.incidentTimestamp.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const incidentTimestamp = incident.incidentTimestamp;

  const incidentTypeCode = incident.specificIncidentCode || incident.incidentCode;
  const cantonId = incident.cantonId;
  const districtId = incident.districtId;

  const [typeInYear, typeInCanton, districtTotal, typePreviousYear] = await Promise.all([
    incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    cantonId && incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.cantonId, cantonId),
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    districtId
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.districtId, districtId),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(
                incidents.incidentTimestamp,
                new Date(year - 1, 0, 1),
                new Date(year - 1, 11, 31, 23, 59, 59)
              )
            )
          )
      : Promise.resolve([{ count: 0 }])
  ]);

  return {
    typeRankInYear: typeInYear[0]?.count ?? 0,
    typeRankInCanton: typeInCanton[0]?.count ?? 0,
    districtIncidentsThisYear: districtTotal[0]?.count ?? 0,
    typeCountPreviousYear: typePreviousYear[0]?.count ?? 0,
    year
  };
}

export type IncidentStatistics = Awaited<ReturnType<typeof getIncidentStatistics>>;
