import { db, desc, eq, sql } from "@bomberoscr/db/index";
import { dispatchedStations, dispatchedVehicles, incidents, stations } from "@bomberoscr/db/schema";

/**
 * Get the most recent incidents where a station was dispatched
 *
 * Returns incidents where the station was involved (via dispatched_stations),
 * ordered by most recent first.
 *
 * @param stationId - The ID of the station to get incidents for
 * @param limit - Number of incidents to return (default: 5)
 * @returns Array of incidents sorted by ID descending
 */
export async function getStationRecentIncidents({
  stationId,
  limit = 5
}: {
  stationId: number;
  limit?: number;
}) {
  // Pre-aggregate counts in subqueries
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

  // Get incidents where the station was dispatched
  const dispatchedToStation = db
    .selectDistinct({
      incidentId: dispatchedStations.incidentId
    })
    .from(dispatchedStations)
    .where(eq(dispatchedStations.stationId, stationId))
    .as("dispatched_to_station");

  return await db
    .select({
      id: incidents.id,
      incidentTimestamp: incidents.incidentTimestamp,
      address: incidents.address,
      importantDetails: incidents.importantDetails,
      responsibleStation: stations.name,
      latitude: incidents.latitude,
      longitude: incidents.longitude,
      dispatchedVehiclesCount: sql<number>`COALESCE(${vehicleCounts.vehicleCount}, 0)`,
      dispatchedStationsCount: sql<number>`COALESCE(${stationCounts.stationCount}, 0)`
    })
    .from(incidents)
    .innerJoin(dispatchedToStation, eq(incidents.id, dispatchedToStation.incidentId))
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .leftJoin(vehicleCounts, eq(incidents.id, vehicleCounts.incidentId))
    .leftJoin(stationCounts, eq(incidents.id, stationCounts.incidentId))
    .orderBy(desc(incidents.id))
    .limit(limit);
}

export type StationRecentIncident = Awaited<ReturnType<typeof getStationRecentIncidents>>[number];
