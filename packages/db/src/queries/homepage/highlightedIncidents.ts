import { db } from "@bomberoscr/db/index";
import { dispatchedStations, dispatchedVehicles, incidents, stations } from "@bomberoscr/db/schema";
import { DEFAULT_TIME_RANGE } from "@bomberoscr/lib/time-range";
import { between, desc, eq, sql } from "drizzle-orm";

/**
 * Get highlighted incidents for the homepage, sorted by total emergency response deployment
 *
 * Returns incidents from the specified time range, each with a calculated `totalDispatched`
 * field representing the sum of dispatched vehicles and stations. Results are ordered by
 * highest deployment first.
 *
 * @param timeRange - Number of days to look back for incidents (7, 30, 90, or 365 days, default: 30)
 * @param limit - Number of incidents to return (default: 5, max: 30)
 * @returns Array of incidents with all fields plus `totalDispatched` count, sorted by deployment size descending
 */
export async function getHighlightedIncidents({
  timeRange = DEFAULT_TIME_RANGE,
  limit = 5
}: {
  timeRange?: number;
  limit?: number;
} = {}) {
  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  // Pre-aggregate counts in subqueries instead of correlated subqueries per row
  const vehicleCounts = db
    .select({
      incidentId: dispatchedVehicles.incidentId,
      vehicleCount: sql<number>`count(*)::int`.as("vehicle_count")
    })
    .from(dispatchedVehicles)
    .groupBy(dispatchedVehicles.incidentId)
    .as("vehicle_counts");

  const stationCounts = db
    .select({
      incidentId: dispatchedStations.incidentId,
      stationCount: sql<number>`count(*)::int`.as("station_count")
    })
    .from(dispatchedStations)
    .groupBy(dispatchedStations.incidentId)
    .as("station_counts");

  return await db
    .select({
      id: incidents.id,
      incidentTimestamp: incidents.incidentTimestamp,
      details: incidents.importantDetails,
      address: incidents.address,
      responsibleStation: stations.name,
      latitude: incidents.latitude,
      longitude: incidents.longitude,
      dispatchedVehiclesCount: sql<number>`COALESCE(${vehicleCounts.vehicleCount}, 0)`,
      dispatchedStationsCount: sql<number>`COALESCE(${stationCounts.stationCount}, 0)`
    })
    .from(incidents)
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .leftJoin(vehicleCounts, eq(incidents.id, vehicleCounts.incidentId))
    .leftJoin(stationCounts, eq(incidents.id, stationCounts.incidentId))
    .where(between(incidents.incidentTimestamp, startDate, endDate))
    .orderBy(
      desc(
        sql`COALESCE(${vehicleCounts.vehicleCount}, 0) + COALESCE(${stationCounts.stationCount}, 0)`
      )
    )
    .limit(limit);
}

export type HighlightedIncident = Awaited<ReturnType<typeof getHighlightedIncidents>>[number];
