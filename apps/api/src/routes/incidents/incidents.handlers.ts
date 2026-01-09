import type { AppRouteHandler } from "@/lib/types";
import { db } from "@bomberoscr/db/index";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations
} from "@bomberoscr/db/schema";
import {
  aliasedTable,
  and,
  asc,
  between,
  desc,
  eq,
  gt,
  inArray,
  lt,
  ne,
  or,
  sql
} from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { generateOgImage } from "@/routes/incidents/incidents.og";
import type { GetOgImageRoute, GetOneRoute, ListRoute } from "@/routes/incidents/incidents.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { limit, cursor, station, view, startTime, endTime, sortBy, sortOrder } =
    c.req.valid("query");

  if (view === "map") {
    return handleMapView(c, { station, startTime, endTime, sortBy, sortOrder });
  }

  return handleDefaultView(c, { limit, cursor, station, startTime, endTime, sortBy, sortOrder });
};

type SortBy = "id" | "incidentTimestamp";
type SortOrder = "asc" | "desc";

type ListQueryParams = {
  limit: number;
  cursor?: number;
  station?: string | null;
  startTime?: Date;
  endTime?: Date;
  sortBy: SortBy;
  sortOrder: SortOrder;
};

async function handleDefaultView(
  c: Parameters<AppRouteHandler<ListRoute>>[0],
  { limit, cursor, station, startTime, endTime, sortBy, sortOrder }: ListQueryParams
) {
  const specificIncidentType = aliasedTable(incidentTypes, "specificIncidentType");

  let stationId: number | undefined = undefined;
  if (station) {
    const stationRecord = await db.query.stations.findFirst({
      where: eq(stations.stationKey, station),
      columns: { id: true }
    });
    stationId = stationRecord?.id;
  }

  const sortColumn = sortBy === "id" ? incidents.id : incidents.incidentTimestamp;
  const cursorOp = sortOrder === "desc" ? lt : gt;
  const orderFn = sortOrder === "desc" ? desc : asc;

  let whereClause = cursor ? cursorOp(incidents.id, cursor) : undefined;

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

  if (startTime && endTime) {
    whereClause = and(whereClause, between(incidents.incidentTimestamp, startTime, endTime));
  }

  const results = await db
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
    .orderBy(orderFn(sortColumn), orderFn(incidents.id));

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return c.json(
    {
      view: "default" as const,
      incidents: data.map((incident) => ({
        ...incident,
        incidentTimestamp: incident.incidentTimestamp.toISOString()
      })),
      nextCursor
    },
    HttpStatusCodes.OK
  );
}

async function handleMapView(
  c: Parameters<AppRouteHandler<ListRoute>>[0],
  { station, startTime, endTime, sortBy, sortOrder }: Omit<ListQueryParams, "limit" | "cursor">
) {
  if (!startTime || !endTime) {
    return c.json({ view: "map" as const, incidents: [] }, HttpStatusCodes.OK);
  }

  let stationId: number | undefined = undefined;
  if (station) {
    const stationRecord = await db.query.stations.findFirst({
      where: eq(stations.stationKey, station),
      columns: { id: true }
    });
    stationId = stationRecord?.id;
  }

  let whereClause = and(
    ne(incidents.latitude, "0"),
    between(incidents.incidentTimestamp, startTime, endTime)
  );

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

  const sortColumn = sortBy === "id" ? incidents.id : incidents.incidentTimestamp;
  const orderFn = sortOrder === "desc" ? desc : asc;

  const results = await db.query.incidents.findMany({
    columns: {
      id: true,
      latitude: true,
      longitude: true
    },
    where: whereClause,
    orderBy: [orderFn(sortColumn), orderFn(incidents.id)]
  });

  return c.json({ view: "map" as const, incidents: results }, HttpStatusCodes.OK);
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const incident = await db.query.incidents.findFirst({
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

  if (!incident) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const statistics = await getIncidentStatistics(incident);

  return c.json({ incident, statistics }, HttpStatusCodes.OK);
};

export const getOgImage: AppRouteHandler<GetOgImageRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const incident = await db.query.incidents.findFirst({
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

  if (!incident) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const statistics = await getIncidentStatistics(incident);
  return generateOgImage(incident, statistics);
};

type DetailedIncident = NonNullable<Awaited<ReturnType<typeof db.query.incidents.findFirst>>>;

async function getIncidentStatistics(incident: DetailedIncident) {
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
