import { db } from "@bomberoscr/db/index";
import { dispatchedStations, incidents, stations } from "@bomberoscr/db/schema";
import {
  DEFAULT_TIME_RANGE,
  type TimeRangeInput,
  timeRangeInputSchema
} from "@bomberoscr/lib/time-range";
import { sql } from "drizzle-orm";

export async function getTopDispatchedStations(
  input: TimeRangeInput = { timeRange: DEFAULT_TIME_RANGE }
) {
  const { timeRange } = timeRangeInputSchema.parse(input);

  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
  const endDate = new Date();

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
