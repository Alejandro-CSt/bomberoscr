import { fetcher } from "@/config/fetcher";
import db from "@bomberoscr/db/db";
import { incidents } from "@bomberoscr/db/schema";
import { getLatestIncidentsListApp } from "@bomberoscr/sync-domain/api";
import { eq } from "drizzle-orm";
import { okAsync } from "neverthrow";

export function getNewIncidents() {
  return getLatestIncidentsListApp(fetcher, 50)
    .andThen((data) => {
      const newIncidents = data.items.filter(
        async (incident) =>
          !(await db
            .select({ id: incidents.id })
            .from(incidents)
            .where(eq(incidents.id, incident.idBoletaIncidente)))
      );
      if (newIncidents.length === 0) return okAsync([]);
      return okAsync(newIncidents.map((incident) => incident.idBoletaIncidente));
    })
    .map((newIncidents) => newIncidents);
}
