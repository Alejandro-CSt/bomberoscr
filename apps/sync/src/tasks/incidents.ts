import { db } from "@bomberoscr/db/index";
import {
  dispatchedVehicles as dispatchedVehiclesTable,
  type incidentsInsertSchema,
  incidents as incidentsTable
} from "@bomberoscr/db/schema";
import logger from "@bomberoscr/lib/logger";
import { getLatestIncidentsListApp } from "@bomberoscr/sigae/api";
import { upsertIncident } from "@bomberoscr/sync-core/upsert-incident";
import * as Sentry from "@sentry/node";
import { and, between, eq, or } from "drizzle-orm";
import type { z } from "zod";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export async function syncLatestIncidents() {
  const span = Sentry.getActiveSpan();
  const response = await getLatestIncidentsListApp(15);
  let newIncidentsCount = 0;
  for (const incident of response.items) {
    const exists = await db.$count(
      incidentsTable,
      eq(incidentsTable.id, incident.idBoletaIncidente)
    );

    if (exists > 0) continue;

    await upsertIncident(incident.idBoletaIncidente);
    newIncidentsCount++;
  }
  span?.setAttribute("newIncidents", newIncidentsCount);
  logger.info(`New incidents synced - Count: ${newIncidentsCount}`);
}

export async function syncOpenIncidents() {
  const span = Sentry.getActiveSpan();
  logger.info("Starting open incidents sync");

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
    ),
    columns: {
      id: true
    }
  });

  span?.setAttribute("openIncidents", openIncidents.length);
  logger.info(`Open incidents found - Count: ${openIncidents.length}`);

  logger.debug("Updating open incidents status");
  const res = await Promise.all(openIncidents.map((incident) => upsertIncident(incident.id)));

  let closedCount = 0;
  for (const incident of res) {
    if (!incident) continue;
    if (await isIncidentClosed(incident)) {
      const incidentAgeMs = Date.now() - new Date(incident.incidentTimestamp).getTime();
      await db
        .update(incidentsTable)
        .set({ isOpen: false, modifiedAt: new Date() })
        .where(eq(incidentsTable.id, incident.id));
      span?.setAttribute("closedIncident", incident.id);
      closedCount++;
      logger.info(
        `Incident closed - ID: ${incident.id}, Age: ${incidentAgeMs / (1000 * 60 * 60)} hours`
      );
    }
  }

  logger.info(
    `Open incidents sync completed - Processed: ${openIncidents.length}, Closed: ${closedCount}, Still open: ${openIncidents.length - closedCount}`
  );
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
