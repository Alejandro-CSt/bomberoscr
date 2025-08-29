import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { eq } from "drizzle-orm";

export async function getDetailedIncidentById(id: number) {
  return await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    columns: {
      id: true,
      incidentTimestamp: true,
      modifiedAt: true,
      isOpen: true,
      importantDetails: true,
      longitude: true,
      latitude: true,
      address: true
    },
    with: {
      dispatchedStations: {
        columns: {
          id: true,
          attentionOnFoot: true,
          serviceTypeId: true
        },
        with: {
          station: {
            columns: {
              name: true,
              latitude: true,
              longitude: true
            }
          }
        }
      },
      dispatchedVehicles: {
        columns: {
          id: true,
          dispatchedTime: true,
          arrivalTime: true,
          departureTime: true,
          baseReturnTime: true
        },
        with: {
          vehicle: {
            columns: {
              id: true,
              internalNumber: true
            }
          },
          station: {
            columns: {
              name: true
            }
          }
        }
      },
      specificIncidentType: {
        columns: {
          name: true
        }
      }
    }
  });
}

export type DetailedIncident = Awaited<ReturnType<typeof getDetailedIncidentById>>;
