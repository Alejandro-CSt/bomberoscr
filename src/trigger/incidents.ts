import db from "@/server/db";
import { dispatchedVehicles, incidents as incidentsTable } from "@/server/db/schema";
import { getLatestIncidentsListApp } from "@/server/sigae/api";
import { upsertIncident } from "@/server/sync/incidents";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { and, eq, or } from "drizzle-orm";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const syncOpenIncidents = schedules.task({
  id: "sync-open-incidents",
  cron: "*/3 * * * *",
  queue: {
    concurrencyLimit: 1
  },
  run: async () => {
    const openIncidents = await db.query.incidents.findMany({
      where: or(
        eq(incidentsTable.isOpen, true),
        eq(incidentsTable.latitude, "0"),
        eq(incidentsTable.longitude, "0")
      )
    });

    logger.info(`Found ${openIncidents.length} open incidents`);

    const res = await Promise.all(openIncidents.map((incident) => upsertIncident(incident.id)));

    for (const incident of res) {
      if (!incident || !incident.incidentTimestamp) continue;

      const incidentAgeMs = Date.now() - new Date(incident.incidentTimestamp).getTime();

      if (incidentAgeMs < THREE_DAYS_MS) continue;

      const vehiclesInScene = await db.query.dispatchedVehicles.findMany({
        where: and(
          eq(incidentsTable.id, incident.id),
          eq(dispatchedVehicles.departureTime, new Date("0001-01-01T00:00:00"))
        )
      });

      if (vehiclesInScene.length > 0) continue;

      await db
        .update(incidentsTable)
        .set({ isOpen: false })
        .where(eq(incidentsTable.id, incident.id));

      logger.info(`Closed incident ${incident.id} after ${(incidentAgeMs / 1000) * 60 * 60} hours`);
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

    let newIncidents = 0;

    for (const incident of response.items) {
      const exists = await db.$count(
        incidentsTable,
        eq(incidentsTable.id, incident.idBoletaIncidente)
      );

      if (exists > 0) continue;

      await upsertIncident(incident.idBoletaIncidente);
      newIncidents++;
    }

    return `There were ${newIncidents} new incidents`;
  }
});
