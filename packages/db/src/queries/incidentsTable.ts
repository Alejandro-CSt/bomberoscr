import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { desc } from "drizzle-orm";

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
    limit,
    orderBy: [desc(incidents.incidentTimestamp)]
  });
}
