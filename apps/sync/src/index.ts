import * as Sentry from "@sentry/node";
import * as cron from "node-cron";
import env from "./env";

import { syncIncidentTypes } from "./tasks/incident-types";
import { syncLatestIncidents, syncOpenIncidents } from "./tasks/incidents";
import { syncStations } from "./tasks/stations";
import { syncVehicleDisponibility } from "./tasks/vehicle-disponibility";
import { syncVehicles } from "./tasks/vehicles";

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

cron.schedule("* * * * *", async () => {
  try {
    await syncLatestIncidents();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});

cron.schedule("*/3 * * * *", async () => {
  try {
    await syncOpenIncidents();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});

cron.schedule("0 */12 * * *", async () => {
  try {
    await syncStations();
    await syncIncidentTypes();
    await syncVehicleDisponibility();
    await syncVehicles();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});
