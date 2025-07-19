import { fetcher } from "@/config/fetcher";
import db, { inArray } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { getLatestIncidentsListApp } from "@bomberoscr/sync-domain/api";
import { ResultAsync, okAsync } from "neverthrow";

export function getNewIncidents() {
  return getLatestIncidentsListApp(fetcher, 50).andThen((data) => {
    if (data.items.length === 0) return okAsync([]);

    const incidentIds = data.items.map((incident) => incident.idBoletaIncidente);

    return ResultAsync.fromPromise(
      db.select({ id: incidents.id }).from(incidents).where(inArray(incidents.id, incidentIds)),
      (error) => new Error(`Database error checking existing incidents: ${error}`)
    ).map((existingIncidents) => {
      const existingIds = new Set(existingIncidents.map((incident) => incident.id));

      const newIncidentIds = incidentIds.filter((id) => !existingIds.has(id));

      return newIncidentIds;
    });
  });
}
