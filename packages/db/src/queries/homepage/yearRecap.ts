import { db } from "@bomberoscr/db/index";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations,
  vehicles
} from "@bomberoscr/db/schema";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

/**
 * Get a comprehensive year recap with key statistics and insights.
 *
 * @param year - The year to get the recap for (e.g., 2024)
 * @returns Promise resolving to an object containing:
 * - `totalIncidents`: Total number of incidents for the year
 * - `frequency`: Average minutes between incidents (null if no incidents)
 * - `busiestDate`: Date with the most incidents and its count (null if no data)
 * - `busiestStation`: Station with the most dispatches and its count (null if no data)
 * - `busiestVehicle`: Vehicle with the most dispatches and its count (null if no data)
 * - `mostPopularIncidentType`: Most common incident type and its count (null if no data)
 */
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

  const minutesInYear = 365 * 24 * 60;
  const frequency = totalIncidents > 0 ? Math.round(minutesInYear / totalIncidents) : null;

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
