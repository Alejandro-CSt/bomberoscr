import db from "@/server/db";
import { dispatchedStations, dispatchedVehicles, incidents, stations } from "@/server/db/schema";
import { and, between, desc, eq, ne } from "drizzle-orm";

export async function getStations(all: boolean) {
  return await db.query.stations.findMany({
    ...(!all && { where: eq(stations.isOperative, true) }),
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

export async function getLatestIncidentsCoordinates() {
  return await db.query.incidents.findMany({
    columns: {
      id: true,
      incidentTimestamp: true,
      latitude: true,
      longitude: true
    },
    where: and(
      ne(incidents.latitude, "0"),
      between(incidents.incidentTimestamp, new Date(Date.now() - 1000 * 60 * 60 * 48), new Date())
    ),
    orderBy: desc(incidents.id)
  });
}

export async function getIncidentsCoordinates(timeRange: "24h" | "48h" | "disabled") {
  if (timeRange === "disabled") return [];
  const hours = timeRange === "24h" ? 24 : 48;
  return await db.query.incidents.findMany({
    columns: {
      id: true,
      incidentTimestamp: true,
      latitude: true,
      longitude: true
    },
    where: and(
      ne(incidents.latitude, "0"),
      between(
        incidents.incidentTimestamp,
        new Date(Date.now() - 1000 * 60 * 60 * hours),
        new Date()
      )
    ),
    orderBy: desc(incidents.id)
  });
}
