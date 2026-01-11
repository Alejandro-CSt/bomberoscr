import { db } from "@bomberoscr/db/index";
import { dispatchedVehicles, incidents, stations } from "@bomberoscr/db/schema";
import {
  DEFAULT_TIME_RANGE,
  type TimeRangeInput,
  timeRangeInputSchema
} from "@bomberoscr/lib/time-range";
import { sql } from "drizzle-orm";

export async function getTopResponseTimesStations(
  input: TimeRangeInput = { timeRange: DEFAULT_TIME_RANGE }
) {
  const { timeRange } = timeRangeInputSchema.parse(input);

  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
  const endDate = new Date();

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

  const nationalAverage = await db
    .select({
      name: sql<string>`'Promedio nacional'`,
      key: sql<string>`''`,
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
    .innerJoin(incidents, sql`${dispatchedVehicles.incidentId} = ${incidents.id}`).where(sql`
      ${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}
      AND ${dispatchedVehicles.arrivalTime} IS NOT NULL
      AND ${dispatchedVehicles.dispatchedTime} IS NOT NULL
      AND ${dispatchedVehicles.arrivalTime} > ${dispatchedVehicles.dispatchedTime}
      AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) >= 60
      AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) <= 10800
    `);

  return [
    ...fastestStations.map((station) => ({ ...station, category: "fastest" as const })),
    ...slowestStations.map((station) => ({ ...station, category: "slowest" as const })),
    ...nationalAverage.map((station) => ({ ...station, category: "average" as const }))
  ];
}
