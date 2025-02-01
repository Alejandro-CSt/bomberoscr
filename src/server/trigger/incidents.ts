import db from "@/server/db";
import { incidents as incidentsTable } from "@/server/db/schema";
import { getLatestIncidentsListApp } from "@/server/sigae/api";
import { upsertIncident } from "@/server/sync/incidents";
import { logger, schedules, schemaTask } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { z } from "zod";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TWO_DAYS_MS = 2 * ONE_DAY_MS;
const FIVE_DAYS_MS = 5 * ONE_DAY_MS;

const calculateDelay = (ageMs: number): string => {
  if (ageMs > TWO_DAYS_MS) {
    return "3h";
  }
  if (ageMs > ONE_DAY_MS) {
    return "1h";
  }
  return "3m";
};

export const syncIncident = schemaTask({
  id: "sync-incident",
  queue: {
    concurrencyLimit: 3
  },
  retry: {
    minTimeoutInMs: 5000,
    maxAttempts: 10
  },
  schema: z.object({
    incidentId: z.number().positive()
  }),
  run: async (payload) => {
    logger.info(`Starting sync for incident ${payload.incidentId}`);
    const incident = await upsertIncident(payload.incidentId);
    logger.info(`Upserted incident ${payload.incidentId}`, { incident });

    const incidentAgeMs = incident?.incidentTimestamp
      ? Date.now() - new Date(incident.incidentTimestamp).getTime()
      : 0;

    const noCoordinates = incident?.latitude === "0" && incident?.longitude === "0";

    if ((!noCoordinates && !incident) || incident.isOpen || (!noCoordinates && !incident.isOpen)) {
      const delay = calculateDelay(incidentAgeMs);
      logger.info(`Scheduling re-sync for incident ${payload.incidentId} with delay ${delay}`);
      await syncIncident.trigger({ incidentId: payload.incidentId }, { delay });
      return `Scheduled sync for incident ${payload.incidentId} in ${delay}`;
    }

    if (noCoordinates && incidentAgeMs > FIVE_DAYS_MS) {
      await db
        .update(incidentsTable)
        .set({ isOpen: false })
        .where(eq(incidentsTable.id, payload.incidentId));
      logger.info(`Closed incident ${payload.incidentId} after 5 days without coordinates`);
      return `Closed incident ${payload.incidentId} after 5 days without coordinates`;
    }
  }
});

export const syncIncidents = schedules.task({
  id: "sync-incidents",
  cron: "*/1 * * * *",
  queue: {
    concurrencyLimit: 1
  },
  run: async () => {
    logger.info("Starting incidents sync");
    const response = await getLatestIncidentsListApp(15);
    logger.info(`Fetched ${response.items.length} incidents from API`);

    const existingIncidents = await Promise.all(
      response.items.map(async (incident) => {
        const result = await db.query.incidents.findFirst({
          where: eq(incidentsTable.id, incident.idBoletaIncidente),
          columns: {
            id: true
          }
        });
        return {
          incident,
          exists: result !== undefined
        };
      })
    );

    const newIncidents = existingIncidents
      .filter((item) => !item.exists)
      .map((item) => item.incident);

    logger.info(`Identified ${newIncidents.length} new incidents`);
    for (const incident of newIncidents) {
      await upsertIncident(incident.idBoletaIncidente);
      logger.info(`Upserted new incident ${incident.idBoletaIncidente}, scheduling initial sync`);
      await syncIncident.trigger(
        {
          incidentId: incident.idBoletaIncidente
        },
        {
          delay: "3m"
        }
      );
    }

    return newIncidents.length;
  }
});
