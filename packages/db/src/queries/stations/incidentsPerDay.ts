import { and, db, eq, gte, sql } from "@bomberoscr/db/index";
import { dispatchedStations, incidents } from "@bomberoscr/db/schema";

export async function getStationIncidentsPerDay({
  stationId,
  days = 365
}: {
  stationId: number;
  days?: number;
}) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const counts = await db
    .select({
      date: sql<string>`date_trunc('day', ${incidents.incidentTimestamp} - interval '6 hours')::date::text`,
      count: sql<number>`count(*)::int`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(eq(dispatchedStations.stationId, stationId), gte(incidents.incidentTimestamp, cutoffDate))
    )
    .groupBy(sql`date_trunc('day', ${incidents.incidentTimestamp} - interval '6 hours')`);

  return counts;
}
