import { count, db, eq, or, sql } from "@bomberoscr/db/index";
import { dispatchedVehicles, incidents, stations, vehicles } from "@bomberoscr/db/schema";

export async function getSystemOverview() {
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  const [stationCount, activeVehicleCount, avgResponseTime] = await Promise.all([
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

    db
      .select({
        avgResponseTimeMinutes: sql<number>`
          ROUND(
            AVG(
              EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) / 60
            )::numeric,
            2
          )::float
        `
      })
      .from(dispatchedVehicles)
      .innerJoin(incidents, eq(dispatchedVehicles.incidentId, incidents.id))
      .where(sql`
        ${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}
        AND ${dispatchedVehicles.arrivalTime} IS NOT NULL
        AND ${dispatchedVehicles.dispatchedTime} IS NOT NULL
        AND ${dispatchedVehicles.arrivalTime} > ${dispatchedVehicles.dispatchedTime}
        AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) >= 60
        AND EXTRACT(EPOCH FROM (${dispatchedVehicles.arrivalTime} - ${dispatchedVehicles.dispatchedTime})) <= 10800
      `)
  ]);

  return {
    stationCount: stationCount[0]?.count ?? 0,
    activeVehicleCount: activeVehicleCount[0]?.count ?? 0,
    avgResponseTimeMinutes: avgResponseTime[0]?.avgResponseTimeMinutes ?? null
  };
}
