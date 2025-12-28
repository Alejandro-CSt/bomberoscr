import { db, desc, eq, sql } from "@bomberoscr/db/index";
import { dispatchedVehicles, incidents, vehicles } from "@bomberoscr/db/schema";

/**
 * Get all vehicles assigned to a station with dispatch statistics
 *
 * @param stationId - The ID of the station to get vehicles for
 * @returns Array of vehicles with stats (incident count, avg response time) for the last 30 days
 */
export async function getStationVehiclesWithStats({ stationId }: { stationId: number }) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const results = await db
    .select({
      id: vehicles.id,
      internalNumber: vehicles.internalNumber,
      plate: vehicles.plate,
      descriptionType: vehicles.descriptionType,
      class: vehicles.class,
      descriptionOperationalStatus: vehicles.descriptionOperationalStatus,
      incidentCount: sql<number>`count(${dispatchedVehicles.id})::int`.as("incident_count"),
      avgResponseTimeSeconds: sql<number | null>`
        round(avg(
          CASE 
            WHEN ${dispatchedVehicles.arrivalTime} > ${dispatchedVehicles.dispatchedTime}
              AND extract(epoch from (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) >= 60
              AND extract(epoch from (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) <= 10800
            THEN extract(epoch from (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime}))
            ELSE NULL 
          END
        ))::int
      `.as("avg_response_time_seconds")
    })
    .from(vehicles)
    .leftJoin(dispatchedVehicles, sql`${dispatchedVehicles.vehicleId} = ${vehicles.id}`)
    .leftJoin(
      incidents,
      sql`${dispatchedVehicles.incidentId} = ${incidents.id} AND ${incidents.incidentTimestamp} >= ${thirtyDaysAgo}`
    )
    .where(eq(vehicles.stationId, stationId))
    .groupBy(vehicles.id)
    .orderBy(desc(sql`count(${dispatchedVehicles.id})`));

  return results.map((row) => ({
    id: row.id,
    internalNumber: row.internalNumber,
    plate: row.plate,
    descriptionType: row.descriptionType,
    class: row.class,
    descriptionOperationalStatus: row.descriptionOperationalStatus,
    stats: {
      incidentCount: row.incidentCount ?? 0,
      avgResponseTimeSeconds: row.avgResponseTimeSeconds
    }
  }));
}

export type StationVehicleWithStats = Awaited<
  ReturnType<typeof getStationVehiclesWithStats>
>[number];
