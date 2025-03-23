import { db } from "@repo/db/db";
import {
  dispatchedVehicles as dispatchedVehiclesTable,
  type incidentsInsertSchema,
  incidents as incidentsTable
} from "@repo/db/schema";
import { getLatestIncidentsListApp } from "@repo/sigae/api";
import { and, between, eq, or } from "drizzle-orm";
import type { z } from "zod";
import { upsertIncident } from "../sync/incidents";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export async function syncLatestIncidents() {
  const response = await getLatestIncidentsListApp(15);
  // let newIncidents = 0;
  for (const incident of response.items) {
    const exists = await db.$count(
      incidentsTable,
      eq(incidentsTable.id, incident.idBoletaIncidente)
    );

    if (exists > 0) continue;

    await upsertIncident(incident.idBoletaIncidente);
    // newIncidents++;
  }
  // log There were ${newIncidents} new incidents
}

export async function syncOpenIncidents() {
  const openIncidents = await db.query.incidents.findMany({
    where: and(
      or(
        eq(incidentsTable.isOpen, true),
        eq(incidentsTable.latitude, "0"),
        eq(incidentsTable.longitude, "0")
      ),
      between(
        incidentsTable.incidentTimestamp,
        new Date(Date.now() - 1000 * 60 * 60 * 72),
        new Date()
      )
    )
  });

  const res = await Promise.all(openIncidents.map((incident) => upsertIncident(incident.id)));
  for (const incident of res) {
    if (!incident) continue;
    if (await isIncidentClosed(incident)) {
      await db
        .update(incidentsTable)
        .set({ isOpen: false, modifiedAt: new Date() })
        .where(eq(incidentsTable.id, incident.id));
      // logger.info(`Closed incident ${incident.id} after ${(incidentAgeMs / 1000) * 60 * 60} hours`);
    }
  }
}

async function isIncidentClosed(incident: z.infer<typeof incidentsInsertSchema>): Promise<boolean> {
  if (!incident.incidentTimestamp) return false;

  const incidentAgeMs = Date.now() - new Date(incident.incidentTimestamp).getTime();

  if (incidentAgeMs < THREE_DAYS_MS) return false;

  const vehiclesInScene = await db.query.dispatchedVehicles.findMany({
    where: and(
      eq(incidentsTable.id, incident.id),
      eq(dispatchedVehiclesTable.departureTime, new Date("0001-01-01T00:00:00"))
    )
  });

  if (vehiclesInScene.length > 0) return false;

  return true;
}
