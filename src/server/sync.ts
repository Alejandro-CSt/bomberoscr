import { getLatestIncidentsListApp } from "./api";
import db from "./db";
import { upsertIncident } from "./sync/incidents";

export async function getNewIncidents() {
  const latestIncidents = (await getLatestIncidentsListApp(100)).items.filter((incident) => {
    const result = db.query.incidents.findFirst({
      where: (incidents, { eq }) => eq(incidents.id, incident.idBoletaIncidente),
      columns: { id: true }
    });
    return !result;
  });
  for (const incident of latestIncidents) await upsertIncident(incident.idBoletaIncidente);
}
