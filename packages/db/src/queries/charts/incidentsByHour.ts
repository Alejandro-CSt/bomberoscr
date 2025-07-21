import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import {
  DEFAULT_TIME_RANGE,
  type TimeRangeInput,
  timeRangeInputSchema
} from "@bomberoscr/lib/time-range";
import { sql } from "drizzle-orm";

export async function getIncidentsByHour(
  input: TimeRangeInput = { timeRange: DEFAULT_TIME_RANGE }
) {
  const { timeRange } = timeRangeInputSchema.parse(input);

  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
  const endDate = new Date();

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
