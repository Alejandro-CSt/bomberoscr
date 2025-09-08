import { db } from "@bomberoscr/db/index";
import { dispatchedStations, incidentTypes, incidents, stations } from "@bomberoscr/db/schema";
import { and, between, eq, inArray, isNull, not, sql } from "drizzle-orm";

function fillMissingDates(data: { day: string; count: number }[], startDate: Date, endDate: Date) {
  const filledData: { day: Date; count: number }[] = [];
  const current = new Date(startDate);

  const existingDates = new Map(
    data.map((item) => [new Date(item.day).toISOString().split("T")[0], item.count])
  );

  while (current <= endDate) {
    const dateKey = current.toISOString().split("T")[0];
    filledData.push({
      day: new Date(current),
      count: existingDates.get(dateKey) || 0
    });
    current.setDate(current.getDate() + 1);
  }

  return filledData;
}

export async function getStationStats(key: string) {
  const now = new Date();
  const [weekIncidents, monthIncidents] = await Promise.all([
    getStationIncidentsGroupedByDayUTCMinus6(key),
    getStationIncidentsGroupedByDayUTCMinus6_30Days(key)
  ]);

  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    week: fillMissingDates(weekIncidents as { day: string; count: number }[], weekStart, now),
    month: fillMissingDates(monthIncidents as { day: string; count: number }[], monthStart, now)
  };
}

export async function getStationIncidentsGroupedByDayUTCMinus6(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new Error("Station not found");

  const now = new Date();
  const last7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      day: sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last7Start, now)
      )
    )
    .groupBy(sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`);

  return result;
}

export async function getStationIncidentsGroupedByDayUTCMinus6_30Days(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new Error("Station not found");

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      day: sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last30Start, now)
      )
    )
    .groupBy(sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp} - interval '6 hour')`);

  return result;
}

export async function getStationIncidentsByHour(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new Error("Station not found");

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      hour: sql`EXTRACT(HOUR FROM ${incidents.incidentTimestamp} - interval '6 hour')`,
      count: sql<number>`COUNT(*)`
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last30Start, now)
      )
    )
    .groupBy(sql`EXTRACT(HOUR FROM ${incidents.incidentTimestamp} - interval '6 hour')`)
    .orderBy(sql`EXTRACT(HOUR FROM ${incidents.incidentTimestamp} - interval '6 hour')`);

  const hourlyData: { hour: number; count: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = result.find((r) => Number(r.hour) === i);
    hourlyData.push({
      hour: i,
      count: hour ? Number(hour.count) : 0
    });
  }

  return hourlyData;
}

export async function getStationIncidentsByTopLevelType(stationKey: string) {
  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, stationKey),
    columns: { id: true }
  });
  if (!station) throw new Error("Station not found");

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentIncidents = await db
    .select({
      incidentCode: incidents.incidentCode
    })
    .from(incidents)
    .innerJoin(dispatchedStations, eq(dispatchedStations.incidentId, incidents.id))
    .where(
      and(
        eq(dispatchedStations.stationId, station.id),
        between(incidents.incidentTimestamp, last30Start, now),
        not(isNull(incidents.incidentCode))
      )
    );

  const groupedIncidents = recentIncidents.reduce<Record<string, number>>((acc, incident) => {
    if (!incident.incidentCode) return acc;
    const parentCode = incident.incidentCode.split(".")[0];
    if (parentCode) {
      acc[parentCode] = (acc[parentCode] || 0) + 1;
    }
    return acc;
  }, {});

  const parentTypes = await db.query.incidentTypes.findMany({
    where: inArray(incidentTypes.incidentCode, Object.keys(groupedIncidents)),
    columns: {
      incidentCode: true,
      name: true
    }
  });

  return parentTypes
    .map((type) => ({
      name: type.name,
      incident_code: type.incidentCode,
      count: groupedIncidents[type.incidentCode] || 0
    }))
    .sort((a, b) => b.count - a.count);
}
