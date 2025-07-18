import { db } from "@bomberoscr/db/db";

export async function getIncidentsForTable({ limit }: { limit: number }) {
  return db.query.incidents.findMany({
    columns: {
      EEConsecutive: true,
      address: true,
      incidentTimestamp: true,
      importantDetails: true,
      isOpen: true
    },
    with: {
      specificIncidentType: {
        columns: {
          name: true
        }
      },
      station: {
        columns: {
          name: true
        }
      }
    },
    limit
  });
}
