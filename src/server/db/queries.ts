import db from "@/server/db";
import { dispatchedStations, dispatchedVehicles, incidents, stations } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getOperativeStations() {
  return await db.query.stations.findMany({
    where: eq(stations.isOperative, true),
    columns: {
      id: true,
      name: true,
      stationKey: true,
      longitude: true,
      latitude: true
    }
  });
}

export async function getStationDetails(id: number) {
  return await db.query.stations.findFirst({
    where: eq(stations.id, id)
  });
}

export async function getStationDetailsWithIncidents(id: number) {
  return await db.query.stations.findFirst({
    where: eq(stations.id, id),
    orderBy: desc(incidents.id),
    with: {
      dispatchedStations: {
        columns: {
          attentionOnFoot: true
        },
        limit: 10,
        orderBy: desc(dispatchedStations.incidentId),
        with: {
          incident: {
            columns: {
              id: true,
              address: true,
              isOpen: true,
              importantDetails: true,
              incidentTimestamp: true
            },
            with: {
              dispatchedVehicles: {
                where: eq(dispatchedVehicles.stationId, id),
                columns: {},
                with: {
                  vehicle: {
                    columns: {
                      id: true,
                      internalNumber: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
}
