import { db, desc, eq, ne, sql } from "@bomberoscr/db/index";
import { dispatchedStations, incidents, stations } from "@bomberoscr/db/schema";

export async function getStationCollaborations({ stationId }: { stationId: number }) {
  const stationIncidents = db
    .selectDistinct({
      incidentId: dispatchedStations.incidentId
    })
    .from(dispatchedStations)
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(eq(dispatchedStations.stationId, stationId))
    .as("station_incidents");

  return await db
    .select({
      id: stations.id,
      name: stations.name,
      stationKey: stations.stationKey,
      collaborationCount: sql<number>`count(*)::int`.as("collaboration_count")
    })
    .from(dispatchedStations)
    .innerJoin(stationIncidents, eq(dispatchedStations.incidentId, stationIncidents.incidentId))
    .innerJoin(stations, eq(dispatchedStations.stationId, stations.id))
    .innerJoin(incidents, eq(dispatchedStations.incidentId, incidents.id))
    .where(ne(dispatchedStations.stationId, stationId))
    .groupBy(stations.id, stations.name, stations.stationKey)
    .orderBy(desc(sql`count(*)`))
    .limit(6);
}

export type StationCollaboration = Awaited<ReturnType<typeof getStationCollaborations>>[number];
