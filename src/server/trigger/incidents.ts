import db from "@/server/db";
import { incidents as incidentsTable } from "@/server/db/schema";
import { getLatestIncidentsListApp } from "@/server/sigae/api";
import { upsertIncident } from "@/server/sync/incidents";
import { schedules, schemaTask } from "@trigger.dev/sdk/v3";
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
  schema: z.object({
    incidentId: z.number().positive()
  }),
  run: async (payload) => {
    const incident = await upsertIncident(payload.incidentId);

    const incidentAgeMs = incident?.incidentTimestamp
      ? Date.now() - new Date(incident.incidentTimestamp).getTime()
      : 0;

    const noCoordinates = incident?.latitude === "0" && incident?.longitude === "0";

    if ((!noCoordinates && !incident) || incident.isOpen || (!noCoordinates && !incident.isOpen)) {
      const delay = calculateDelay(incidentAgeMs);
      await syncIncident.trigger({ incidentId: payload.incidentId }, { delay });
      return `Scheduled sync for incident ${payload.incidentId} in ${delay}`;
    }

    if (noCoordinates && incidentAgeMs > FIVE_DAYS_MS) {
      await db
        .update(incidentsTable)
        .set({ isOpen: false })
        .where(eq(incidentsTable.id, payload.incidentId));
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
    const response = await getLatestIncidentsListApp(15);

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

    for (const incident of newIncidents) {
      await upsertIncident(incident.idBoletaIncidente);
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
