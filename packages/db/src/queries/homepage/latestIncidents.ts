import { db } from "@bomberoscr/db/index";
import { dispatchedStations, dispatchedVehicles, incidents, stations } from "@bomberoscr/db/schema";
import { desc, eq, sql } from "drizzle-orm";

/**
 * Get the latest incidents for the homepage
 *
 * Returns the most recent incidents ordered by incident ID descending.
 * We use ID instead of timestamp because operators sometimes enter incorrect dates.
 *
 * @param limit - Number of incidents to return (default: 5, max: 30)
 * @returns Array of latest incidents sorted by ID descending
 */
export async function getLatestIncidents({
  limit = 5
}: {
  limit?: number;
} = {}) {
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
      address: incidents.address,
      importantDetails: incidents.importantDetails,
      responsibleStation: stations.name,
      dispatchedVehiclesCount: sql<number>`COALESCE(${vehicleCounts.vehicleCount}, 0)`,
      dispatchedStationsCount: sql<number>`COALESCE(${stationCounts.stationCount}, 0)`
    })
    .from(incidents)
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .leftJoin(vehicleCounts, eq(incidents.id, vehicleCounts.incidentId))
    .leftJoin(stationCounts, eq(incidents.id, stationCounts.incidentId))
    .orderBy(desc(incidents.id))
    .limit(limit);
}

export type LatestIncident = Awaited<ReturnType<typeof getLatestIncidents>>[number];
