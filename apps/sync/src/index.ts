import env from "@/env";
import { initializeData, isFirstRun } from "@/init";
import { syncDistricts } from "@/tasks/districts";
import { syncIncidentTypes } from "@/tasks/incident-types";
import { syncLatestIncidents, syncOpenIncidents } from "@/tasks/incidents";
import { syncStations } from "@/tasks/stations";
import { syncVehicleDisponibility } from "@/tasks/vehicle-disponibility";
import { syncVehicles } from "@/tasks/vehicles";
import logger from "@bomberoscr/lib/logger";
import * as Sentry from "@sentry/node";
import * as cron from "node-cron";

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.25 : 1.0,
  environment: process.env.NODE_ENV
});

async function initializeApp() {
  if (await isFirstRun()) {
    await initializeData();
  }

  logger.info("Setting up scheduled tasks");
  setupCronJobs();
}

function setupCronJobs() {
  cron.schedule("* * * * *", async () => {
    Sentry.startSpan(
      {
        name: "sync-latest-incidents",
        op: "cron.sync-latest-incidents"
      },
      async () => {
        logger.info("Sync latest incidents");
        await syncLatestIncidents();
      }
    );
  });

  cron.schedule("*/3 * * * *", async () => {
    Sentry.startSpan(
      {
        name: "sync-open-incidents",
        op: "cron.sync-open-incidents"
      },
      async () => {
        logger.info("Sync open incidents");
        await syncOpenIncidents();
      }
    );
  });

  cron.schedule("0 */12 * * *", async () => {
    Sentry.startSpan(
      {
        name: "sync-metadata",
        op: "cron.sync-metadata"
      },
      async () => {
        logger.info("Sync metadata");
        await syncStations();
        await syncIncidentTypes();
        await syncVehicleDisponibility();
        await syncVehicles();
        await syncDistricts();
        Sentry.getActiveSpan()?.end();
      }
    );
  });
}

logger.info(`Sync service started - PID: ${process.pid} - ENV: ${process.env.NODE_ENV}`);

initializeApp().catch((error) => {
  logger.error("Failed to initialize app:", error);
  Sentry.captureException(error);
});
