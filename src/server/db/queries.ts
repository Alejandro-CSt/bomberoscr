import db from "@/server/db";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import {
  aliasedTable,
  and,
  asc,
  between,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  lt,
  ne,
  not,
  sql
} from "drizzle-orm";

export async function getStations(all: boolean) {
  return await db.query.stations.findMany({
    ...(!all && { where: eq(stations.isOperative, true) }),
    columns: {
      id: true,
      name: true,
      stationKey: true,
      longitude: true,
      latitude: true
    },
    orderBy: asc(stations.id)
  });
}

export async function getStationDetails(key: string) {
  return (
    (await db.query.stations.findFirst({
      where: eq(stations.stationKey, key)
    })) || null
  );
}

export async function getStationIncidents(key: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, key),
    columns: {
      id: true
    }
  });

  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  return await db.query.dispatchedStations.findMany({
    where: eq(dispatchedStations.stationId, station.id),
    orderBy: desc(dispatchedStations.incidentId),
    limit: 15,
    with: {
      incident: {
        columns: {
          id: true,
          address: true,
          responsibleStation: true,
          incidentTimestamp: true,
          isOpen: true,
          importantDetails: true
        },
        with: {
          dispatchedVehicles: {
            columns: {
              id: true
            }
          },
          dispatchIncidentType: {
            columns: {
              name: true
            }
          },
          incidentType: {
            columns: {
              name: true
            }
          }
        }
      }
    }
  });
}

function fillMissingDates(data: { day: string; count: number }[], startDate: Date, endDate: Date) {
  const filledData: { day: Date; count: number }[] = [];
  const current = new Date(startDate);

  const existingDates = new Map(
    data.map((item) => [new Date(item.day).toISOString().split("T")[0], item.count])
  );

  while (current <= endDate) {
    const dateKey = current.toISOString().split("T")[0];
    filledData.push({
      day: new Date(current),
      count: existingDates.get(dateKey) || 0
    });
    current.setDate(current.getDate() + 1);
  }

  return filledData;
}

export async function getStationStats(key: string) {
  const now = new Date();
  const [weekIncidents, monthIncidents] = await Promise.all([
    getStationIncidentsGroupedByDayUTCMinus6(key),
    getStationIncidentsGroupedByDayUTCMinus6_30Days(key)
  ]);

  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    week: fillMissingDates(weekIncidents as { day: string; count: number }[], weekStart, now),
    month: fillMissingDates(monthIncidents as { day: string; count: number }[], monthStart, now)
  };
}

export async function getLatestIncidents({
  limit,
  cursor,
  stationFilter
}: { limit: number; cursor: number | null; stationFilter?: string | null }) {
  const specificIncidentType = aliasedTable(incidentTypes, "specificIncidentType");
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
    .where(
      and(
        cursor ? lt(incidents.id, cursor) : undefined,
        stationFilter ? ilike(stations.name, stationFilter) : undefined
      )
    )
    .limit(limit + 1)
    .leftJoin(incidentTypes, eq(incidents.incidentCode, incidentTypes.incidentCode))
    .leftJoin(
      specificIncidentType,
      eq(incidents.specificIncidentCode, specificIncidentType.incidentCode)
    )
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .orderBy(desc(incidents.id));
}

export async function getLatestIncidentsCoordinates() {
  return await db.query.incidents.findMany({
    columns: {
      id: true,
      incidentTimestamp: true,
      latitude: true,
      longitude: true
    },
    where: and(
      ne(incidents.latitude, "0"),
      between(incidents.incidentTimestamp, new Date(Date.now() - 1000 * 60 * 60 * 48), new Date())
    ),
    orderBy: desc(incidents.id)
  });
}

export async function getIncidentsCoordinates(timeRange: "24h" | "48h" | "disabled") {
  if (timeRange === "disabled") return [];
  const hours = timeRange === "24h" ? 24 : 48;
  return await db.query.incidents.findMany({
    columns: {
      id: true,
      incidentTimestamp: true,
      latitude: true,
      longitude: true
    },
    where: and(
      ne(incidents.latitude, "0"),
      between(
        incidents.incidentTimestamp,
        new Date(Date.now() - 1000 * 60 * 60 * hours),
        new Date()
      )
    ),
    orderBy: desc(incidents.id)
  });
}

export async function getIncidentById(id: number) {
  return await db
    .select({
      id: incidents.id,
      EEConsecutive: incidents.EEConsecutive,
      isOpen: incidents.isOpen,
      importantDetails: incidents.importantDetails,
      incidentTimestamp: incidents.incidentTimestamp,
      address: incidents.address,
      responsibleStation: stations.name,
      dispatchesVehiclesCount: db.$count(
        dispatchedVehicles,
        eq(dispatchedVehicles.incidentId, incidents.id)
      ),
      dispatchedStationsCount: db.$count(
        dispatchedStations,
        eq(dispatchedStations.incidentId, incidents.id)
      )
    })
    .from(incidents)
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .where(eq(incidents.id, id))
    .limit(1);
}

export async function getDetailedIncidentById(id: number) {
  return await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    with: {
      dispatchedStations: {
        columns: {
          id: true,
          attentionOnFoot: true,
          serviceTypeId: true
        },
        with: {
          station: {
            columns: {
              name: true
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

export async function getIncidentsComparison() {
  const now = new Date();
  const lastWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const prevWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const lastWeekRes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(incidents)
    .where(between(incidents.incidentTimestamp, lastWeekStart, now));

  const prevWeekRes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(incidents)
    .where(between(incidents.incidentTimestamp, prevWeekStart, lastWeekStart));

  return {
    lastWeek: Number(lastWeekRes[0].count),
    prevWeek: Number(prevWeekRes[0].count)
  };
}

export async function getIncidentsComparison30Days() {
  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prev30Start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const last30Res = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(incidents)
    .where(between(incidents.incidentTimestamp, last30Start, now));

  const prev30Res = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(incidents)
    .where(between(incidents.incidentTimestamp, prev30Start, last30Start));

  return {
    last30: Number(last30Res[0].count),
    prev30: Number(prev30Res[0].count)
  };
}

export async function getStationIncidents24h(key: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, key),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });
  const now = new Date();
  const last24Start = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const last24Res = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(incidents)
    .where(
      and(
        between(incidents.incidentTimestamp, last24Start, now),
        eq(incidents.responsibleStation, station.id)
      )
    );

  return {
    last24: Number(last24Res[0].count)
  };
}

export async function getStationIncidentsComparison(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  const now = new Date();
  const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const lastWeekRes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, lastWeekStart, now)
      )
    );

  const prevWeekRes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, prevWeekStart, lastWeekStart)
      )
    );

  return {
    lastWeek: Number(lastWeekRes[0].count),
    prevWeek: Number(prevWeekRes[0].count)
  };
}

export async function getStationIncidentsComparison30Days(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prev30Start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const last30Res = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last30Start, now)
      )
    );

  const prev30Res = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, prev30Start, last30Start)
      )
    );

  return {
    last30: Number(last30Res[0].count),
    prev30: Number(prev30Res[0].count)
  };
}

export async function getStationDailyIncidentsComparison(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  const now = new Date();
  const currentWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentWeek = await db
    .select({
      day: sql`DATE(${incidents.incidentTimestamp})`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, currentWeekStart, now)
      )
    )
    .groupBy(sql`DATE(${incidents.incidentTimestamp})`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp})`);

  const previousWeek = await db
    .select({
      day: sql`DATE(${incidents.incidentTimestamp})`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, previousWeekStart, currentWeekStart)
      )
    )
    .groupBy(sql`DATE(${incidents.incidentTimestamp})`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp})`);

  return {
    currentWeek,
    previousWeek
  };
}

export async function getStationWeeklyIncidentsComparison30Days(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prev30Start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const currentPeriod = await db
    .select({
      week: sql`DATE_TRUNC('week', ${incidents.incidentTimestamp})`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last30Start, now)
      )
    )
    .groupBy(sql`DATE_TRUNC('week', ${incidents.incidentTimestamp})`)
    .orderBy(sql`DATE_TRUNC('week', ${incidents.incidentTimestamp})`);

  const previousPeriod = await db
    .select({
      week: sql`DATE_TRUNC('week', ${incidents.incidentTimestamp})`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, prev30Start, last30Start)
      )
    )
    .groupBy(sql`DATE_TRUNC('week', ${incidents.incidentTimestamp})`)
    .orderBy(sql`DATE_TRUNC('week', ${incidents.incidentTimestamp})`);

  return {
    currentPeriod,
    previousPeriod
  };
}

export async function getStationIncidentsGroupedByDayUTCMinus6(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  const now = new Date();
  const last7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      day: sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last7Start, now)
      )
    )
    .groupBy(sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`);

  return result;
}

export async function getStationIncidentsGroupedByDayUTCMinus6_30Days(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      day: sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last30Start, now)
      )
    )
    .groupBy(sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`);

  return result;
}

export async function getStationIncidentsByHour(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      hour: sql`EXTRACT(HOUR FROM ${incidents.incidentTimestamp} - interval '6 hour')`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last30Start, now)
      )
    )
    .groupBy(sql`EXTRACT(HOUR FROM ${incidents.incidentTimestamp} - interval '6 hour')`)
    .orderBy(sql`EXTRACT(HOUR FROM ${incidents.incidentTimestamp} - interval '6 hour')`);

  const hourlyData: { hour: number; count: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = result.find((r) => Number(r.hour) === i);
    hourlyData.push({
      hour: i,
      count: hour ? Number(hour.count) : 0
    });
  }

  return hourlyData;
}

export async function getStationIncidentsByTopLevelType(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new TRPCError({ code: "NOT_FOUND" });

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentIncidents = await db
    .select({
      incidentCode: incidents.incidentCode
    })
    .from(incidents)
    .innerJoin(dispatchedStations, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last30Start, now),
        not(isNull(incidents.incidentCode))
      )
    );

  const groupedIncidents = recentIncidents.reduce<Record<string, number>>((acc, incident) => {
    if (!incident.incidentCode) return acc;
    const parentCode = incident.incidentCode.split(".")[0];
    acc[parentCode] = (acc[parentCode] || 0) + 1;
    return acc;
  }, {});

  const parentTypes = await db.query.incidentTypes.findMany({
    where: inArray(incidentTypes.incidentCode, Object.keys(groupedIncidents)),
    columns: {
      incidentCode: true,
      name: true
    }
  });

  return parentTypes
    .map((type) => ({
      name: type.name,
      incident_code: type.incidentCode,
      count: groupedIncidents[type.incidentCode] || 0
    }))
    .sort((a, b) => b.count - a.count);
}
