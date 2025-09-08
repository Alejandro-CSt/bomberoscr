import { db } from "@bomberoscr/db/index";
import { dispatchedStations, stations } from "@bomberoscr/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export async function getStations(all: boolean) {
  return await db.query.stations.findMany({
    ...(!all && { where: eq(stations.isOperative, true) }),
    columns: {
      id: true,
      name: true,
      stationKey: true,
      longitude: true,
      latitude: true
    },
    orderBy: asc(stations.name)
  });
}

export async function getStationDetails(key: string) {
  return (
    (await db.query.stations.findFirst({
      where: eq(stations.stationKey, key)
    })) || null
  );
}

export async function getStationIncidents(id: number) {
  return await db.query.dispatchedStations.findMany({
    where: eq(dispatchedStations.stationId, id),
    orderBy: desc(dispatchedStations.incidentId),
    limit: 15,
    with: {
      incident: {
        columns: {
          id: true,
          address: true,
          responsibleStation: true,
          incidentTimestamp: true,
          isOpen: true,
          importantDetails: true
        },
        with: {
          dispatchedVehicles: {
            columns: {
              id: true
            }
          },
          dispatchIncidentType: {
            columns: {
              name: true
            }
          },
          incidentType: {
            columns: {
              name: true
            }
          }
        }
      }
    }
  });
}
