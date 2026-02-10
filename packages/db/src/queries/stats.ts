import { db, count, eq, or, sql } from "@bomberoscr/db/index";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations,
  vehicles
} from "@bomberoscr/db/schema";
import { and, desc, gte, lt } from "drizzle-orm";

// ============================================================================
// Year Recap
// ============================================================================

export async function getYearRecap(year: number) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const [totalIncidentsResult] = await db
    .select({
      count: sql<number>`count(*)`
    })
    .from(incidents)
    .where(
      and(gte(incidents.incidentTimestamp, startOfYear), lt(incidents.incidentTimestamp, endOfYear))
    );

  const totalIncidents = totalIncidentsResult?.count || 0;

  const now = new Date();
  const effectiveEnd = now < endOfYear ? now : endOfYear;
  const elapsedMinutes = Math.floor((effectiveEnd.getTime() - startOfYear.getTime()) / (1000 * 60));
  const frequency = totalIncidents > 0 ? Math.round(elapsedMinutes / totalIncidents) : null;

  const [busiestDateResult] = await db
    .select({
      date: sql<string>`DATE(${incidents.incidentTimestamp})`,
      count: sql<number>`count(*)`
    })
    .from(incidents)
    .where(
      and(gte(incidents.incidentTimestamp, startOfYear), lt(incidents.incidentTimestamp, endOfYear))
    )
    .groupBy(sql`DATE(${incidents.incidentTimestamp})`)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const busiestDate = busiestDateResult
    ? {
        date: busiestDateResult.date,
        count: busiestDateResult.count
      }
    : null;

  const [busiestStationResult] = await db
    .select({
      name: stations.name,
      count: sql<number>`count(*)`
    })
    .from(stations)
    .innerJoin(dispatchedStations, eq(stations.id, dispatchedStations.stationId))
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(gte(incidents.incidentTimestamp, startOfYear), lt(incidents.incidentTimestamp, endOfYear))
    )
    .groupBy(stations.id, stations.name)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const busiestStation = busiestStationResult
    ? {
        name: busiestStationResult.name,
        count: busiestStationResult.count
      }
    : null;

  const [busiestVehicleResult] = await db
    .select({
      internalNumber: vehicles.internalNumber,
      plate: vehicles.plate,
      count: sql<number>`count(*)`
    })
    .from(vehicles)
    .innerJoin(dispatchedVehicles, eq(vehicles.id, dispatchedVehicles.vehicleId))
    .innerJoin(incidents, eq(dispatchedVehicles.incidentId, incidents.id))
    .where(
      and(gte(incidents.incidentTimestamp, startOfYear), lt(incidents.incidentTimestamp, endOfYear))
    )
    .groupBy(vehicles.id, vehicles.internalNumber, vehicles.plate)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const busiestVehicle = busiestVehicleResult
    ? {
        internalNumber: busiestVehicleResult.internalNumber,
        plate: busiestVehicleResult.plate,
        count: busiestVehicleResult.count
      }
    : null;

  const [mostPopularIncidentTypeResult] = await db
    .select({
      name: incidentTypes.name,
      code: incidentTypes.incidentCode,
      count: sql<number>`count(*)`
    })
    .from(incidentTypes)
    .innerJoin(incidents, eq(incidentTypes.incidentCode, incidents.specificIncidentCode))
    .where(
      and(gte(incidents.incidentTimestamp, startOfYear), lt(incidents.incidentTimestamp, endOfYear))
    )
    .groupBy(incidentTypes.id, incidentTypes.name, incidentTypes.incidentCode)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const mostPopularIncidentType = mostPopularIncidentTypeResult
    ? {
        name: mostPopularIncidentTypeResult.name,
        code: mostPopularIncidentTypeResult.code,
        count: mostPopularIncidentTypeResult.count
      }
    : null;

  return {
    totalIncidents,
    frequency,
    busiestDate,
    busiestStation,
    busiestVehicle,
    mostPopularIncidentType
  };
}

// ============================================================================
// Incidents by Type
// ============================================================================

export async function getIncidentsByType({
  startDate,
  endDate,
  limit = 6
}: {
  startDate: Date;
  endDate: Date;
  limit?: number;
}) {
  const incidentTypesBreakdown = await db
    .select({
      code: incidentTypes.incidentCode,
      name: sql<string>`coalesce(${incidentTypes.name}, 'Sin clasificar')`,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .leftJoin(incidentTypes, eq(incidents.specificIncidentCode, incidentTypes.incidentCode))
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}`)
    .groupBy(incidentTypes.incidentCode, incidentTypes.name)
    .orderBy(desc(sql`count(*)`));

  const topTypes = incidentTypesBreakdown.slice(0, limit).map((item) => ({
    code: item.code,
    name: item.name,
    count: Number(item.count)
  }));

  const otherCount = incidentTypesBreakdown
    .slice(limit)
    .reduce((sum, item) => sum + Number(item.count), 0);

  if (otherCount > 0) {
    topTypes.push({
      code: null,
      name: "Otros",
      count: otherCount
    });
  }

  return topTypes;
}

// ============================================================================
// Top Dispatched Stations
// ============================================================================

export async function getTopDispatchedStations({
  startDate,
  endDate
}: {
  startDate: Date;
  endDate: Date;
}) {
  return await db
    .select({
      name: stations.name,
      key: stations.stationKey,
      total: sql<number>`count(*)`,
      responsible: sql<number>`sum(
        case
          when ${incidents.responsibleStation} = ${stations.id} then 1
          else 0
        end
      )`,
      support: sql<number>`sum(
        case
          when ${incidents.responsibleStation} != ${stations.id} then 1
          else 0
        end
      )`
    })
    .from(stations)
    .innerJoin(dispatchedStations, sql`${stations.id} = ${dispatchedStations.stationId}`)
    .innerJoin(incidents, sql`${dispatchedStations.incidentId} = ${incidents.id}`)
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}`)
    .groupBy(stations.id, stations.name)
    .orderBy(sql`count(*) desc`)
    .limit(7);
}

// ============================================================================
// Top Response Times Stations
// ============================================================================

export async function getTopResponseTimesStations({
  startDate,
  endDate
}: {
  startDate: Date;
  endDate: Date;
}) {
  const baseQuery = db
    .select({
      name: stations.name,
      key: stations.stationKey,
      avgResponseTimeMinutes: sql<number>`
        ROUND(
          AVG(
            EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) / 60
          )::numeric, 
          2
        )::float
      `,
      totalDispatches: sql<number>`count(*)::int`,
      fastestResponseMinutes: sql<number>`
        ROUND(
          MIN(
            EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) / 60
          )::numeric, 
          2
        )::float
      `,
      slowestResponseMinutes: sql<number>`
        ROUND(
          MAX(
            EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) / 60
          )::numeric, 
          2
        )::float
      `
    })
    .from(stations)
    .innerJoin(dispatchedVehicles, sql`${stations.id} = ${dispatchedVehicles.stationId}`)
    .innerJoin(incidents, sql`${dispatchedVehicles.incidentId} = ${incidents.id}`)
    .where(sql`
      ${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}
      AND ${dispatchedVehicles.arrivalTime} IS NOT NULL
      AND ${dispatchedVehicles.dispatchedTime} IS NOT NULL
      AND ${dispatchedVehicles.arrivalTime} > ${dispatchedVehicles.dispatchedTime}
      AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) >= 60
      AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) <= 10800
    `)
    .groupBy(stations.id, stations.name, stations.stationKey)
    .having(sql`count(*) >= 10`);

  const fastestStations = await baseQuery
    .orderBy(sql`
      AVG(
        EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) / 60
      ) ASC
    `)
    .limit(3);

  const slowestStations = await baseQuery
    .orderBy(sql`
      AVG(
        EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) / 60
      ) DESC
    `)
    .limit(3);

  const nationalAverage = await db.execute(sql`
    WITH valid_dispatches AS (
      SELECT 
        ${dispatchedVehicles.stationId},
        EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) / 60 as response_time_minutes
      FROM ${dispatchedVehicles}
      INNER JOIN ${incidents} ON ${dispatchedVehicles.incidentId} = ${incidents.id}
      WHERE ${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}
        AND ${dispatchedVehicles.arrivalTime} IS NOT NULL
        AND ${dispatchedVehicles.dispatchedTime} IS NOT NULL
        AND ${dispatchedVehicles.arrivalTime} > ${dispatchedVehicles.dispatchedTime}
        AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) >= 60
        AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) <= 10800
    ),
    stations_with_min_incidents AS (
      SELECT "stationId"
      FROM valid_dispatches
      GROUP BY "stationId"
      HAVING count(*) >= 10
    )
    SELECT 
      'Promedio nacional' as name,
      '' as key,
      ROUND(AVG(vd.response_time_minutes), 2)::float as avg_response_time_minutes,
      count(*)::int as total_dispatches,
      ROUND(MIN(vd.response_time_minutes), 2)::float as fastest_response_minutes,
      ROUND(MAX(vd.response_time_minutes), 2)::float as slowest_response_minutes
    FROM valid_dispatches vd
    INNER JOIN stations_with_min_incidents swm ON vd."stationId" = swm."stationId"
  `);

  const avgResult = nationalAverage as unknown as {
    rows: Array<{
      name: string;
      key: string;
      avg_response_time_minutes: number;
      total_dispatches: number;
      fastest_response_minutes: number;
      slowest_response_minutes: number;
    }>;
  };

  const nationalAverageRow = avgResult.rows?.[0];

  return [
    ...fastestStations.map((station) => ({ ...station, category: "fastest" as const })),
    ...slowestStations.map((station) => ({ ...station, category: "slowest" as const })),
    ...(nationalAverageRow
      ? [
          {
            name: nationalAverageRow.name,
            key: nationalAverageRow.key,
            avgResponseTimeMinutes: nationalAverageRow.avg_response_time_minutes,
            totalDispatches: nationalAverageRow.total_dispatches,
            fastestResponseMinutes: nationalAverageRow.fastest_response_minutes,
            slowestResponseMinutes: nationalAverageRow.slowest_response_minutes,
            category: "average" as const
          }
        ]
      : [])
  ];
}

// ============================================================================
// Incidents by Day of Week
// ============================================================================

export async function getIncidentsByDayOfWeek({
  startDate,
  endDate
}: {
  startDate: Date;
  endDate: Date;
}) {
  const dayOfWeekOrder = {
    Lunes: 0,
    Martes: 1,
    Miércoles: 2,
    Jueves: 3,
    Viernes: 4,
    Sábado: 5,
    Domingo: 6
  };

  const results = await db
    .select({
      dayOfWeek: sql<string>`
        CASE 
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 1 THEN 'Lunes'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 2 THEN 'Martes'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 3 THEN 'Miércoles'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 4 THEN 'Jueves'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 5 THEN 'Viernes'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 6 THEN 'Sábado'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 0 THEN 'Domingo'
        END
      `,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}`).groupBy(sql`
      CASE 
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 1 THEN 'Lunes'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 2 THEN 'Martes'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 3 THEN 'Miércoles'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 4 THEN 'Jueves'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 5 THEN 'Viernes'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 6 THEN 'Sábado'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 0 THEN 'Domingo'
      END
    `);

  const sortedResults = Object.entries(dayOfWeekOrder)
    .map(([dayName, order]) => {
      const existing = results.find((r) => r.dayOfWeek === dayName);
      return {
        dayOfWeek: dayName,
        count: existing?.count || 0,
        order
      };
    })
    .sort((a, b) => a.order - b.order);

  return sortedResults.map(({ dayOfWeek, count }) => ({
    dayOfWeek,
    count
  }));
}

// ============================================================================
// Incidents by Hour
// ============================================================================

export async function getIncidentsByHour({
  startDate,
  endDate
}: {
  startDate: Date;
  endDate: Date;
}) {
  const results = await db
    .select({
      hour: sql<number>`EXTRACT(HOUR FROM ${incidents.incidentTimestamp})::int`,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}`)
    .groupBy(sql`EXTRACT(HOUR FROM ${incidents.incidentTimestamp})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${incidents.incidentTimestamp})`);

  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const hourMap = new Map(results.map((r) => [r.hour, r.count]));

  return allHours.map((hour) => ({
    hour,
    count: hourMap.get(hour) || 0,
    displayHour: `${hour.toString().padStart(2, "0")}:00`
  }));
}

// ============================================================================
// Daily Incidents
// ============================================================================

export async function getDailyIncidents({
  startDate,
  endDate
}: {
  startDate: Date;
  endDate: Date;
}) {
  const currentStartDate = new Date(startDate);
  currentStartDate.setHours(0, 0, 0, 0);

  const currentEndDate = new Date(endDate);
  currentEndDate.setHours(23, 59, 59, 999);

  const timeRange =
    Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const previousEndDate = new Date(currentStartDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);
  previousEndDate.setHours(23, 59, 59, 999);

  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - (timeRange - 1));
  previousStartDate.setHours(0, 0, 0, 0);

  const currentPeriod = await db
    .select({
      date: sql<string>`DATE(${incidents.incidentTimestamp})`,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${currentStartDate} AND ${currentEndDate}`)
    .groupBy(sql`DATE(${incidents.incidentTimestamp})`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp})`);

  const previousPeriod = await db
    .select({
      date: sql<string>`DATE(${incidents.incidentTimestamp})`,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${previousStartDate} AND ${previousEndDate}`)
    .groupBy(sql`DATE(${incidents.incidentTimestamp})`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp})`);

  const fillMissingDates = (data: typeof currentPeriod, startDate: Date, endDate: Date) => {
    const result = [];
    const current = new Date(startDate);

    const toLocalISOString = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    while (current <= endDate) {
      const dateStr = toLocalISOString(current);
      const existingData = data.find((d) => d.date === dateStr);

      result.push({
        date: dateStr,
        count: existingData ? Number(existingData.count) : 0
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  };

  const currentData = fillMissingDates(currentPeriod, currentStartDate, currentEndDate);
  const previousData = fillMissingDates(previousPeriod, previousStartDate, previousEndDate);

  const combinedData = currentData.map((current, index) => {
    const previous = previousData[index];
    const dayOffset = index + 1;

    return {
      date: current.date,
      dayOffset,
      current: current.count,
      previous: previous?.count || 0,
      displayDate: current.date
        ? new Date(`${current.date}T00:00:00`).toLocaleDateString("es-CR", {
            month: "short",
            day: "numeric",
            timeZone: "America/Costa_Rica"
          })
        : ""
    };
  });

  const currentTotal = currentData.reduce((sum, item) => sum + Number(item.count), 0);
  const previousTotal = previousData.reduce((sum, item) => sum + Number(item.count), 0);
  const percentageChange =
    previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  return {
    data: combinedData,
    summary: {
      currentTotal,
      previousTotal,
      percentageChange
    }
  };
}

// ============================================================================
// System Overview
// ============================================================================

export async function getSystemOverview() {
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  const [stationCount, activeVehicleCount, avgResponseTimeResult] = await Promise.all([
    db.select({ count: count() }).from(stations).where(eq(stations.isOperative, true)),

    db
      .select({ count: count() })
      .from(vehicles)
      .where(
        or(
          eq(vehicles.descriptionOperationalStatus, "DISPONIBLE"),
          eq(vehicles.descriptionOperationalStatus, "EN INCIDENTE")
        )
      ),

    db.execute(sql`
      WITH valid_dispatches AS (
        SELECT 
          ${dispatchedVehicles.stationId},
          EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) / 60 as response_time_minutes
        FROM ${dispatchedVehicles}
        INNER JOIN ${incidents} ON ${dispatchedVehicles.incidentId} = ${incidents.id}
        WHERE ${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}
          AND ${dispatchedVehicles.arrivalTime} IS NOT NULL
          AND ${dispatchedVehicles.dispatchedTime} IS NOT NULL
          AND ${dispatchedVehicles.arrivalTime} > ${dispatchedVehicles.dispatchedTime}
          AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) >= 60
          AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) <= 10800
      ),
      stations_with_min_incidents AS (
        SELECT "stationId"
        FROM valid_dispatches
        GROUP BY "stationId"
        HAVING count(*) >= 10
      )
      SELECT 
        ROUND(AVG(vd.response_time_minutes), 2)::float as avg_response_time_minutes
      FROM valid_dispatches vd
      INNER JOIN stations_with_min_incidents swm ON vd."stationId" = swm."stationId"
    `)
  ]);

  const avgResult = avgResponseTimeResult as unknown as {
    rows: [{ avg_response_time_minutes: number | null }];
  };

  return {
    stationCount: stationCount[0]?.count ?? 0,
    activeVehicleCount: activeVehicleCount[0]?.count ?? 0,
    avgResponseTimeMinutes: avgResult.rows?.[0]?.avg_response_time_minutes ?? null
  };
}
