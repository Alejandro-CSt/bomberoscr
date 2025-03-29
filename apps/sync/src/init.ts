import logger from "@/lib/logger";
import { syncIncidentTypes } from "@/tasks/incident-types";
import { syncStations } from "@/tasks/stations";
import { syncVehicleDisponibility } from "@/tasks/vehicle-disponibility";
import { syncVehicles } from "@/tasks/vehicles";
import db from "@bomberoscr/db/db";
import { incidentTypes, stations, vehicleDisponibility } from "@bomberoscr/db/schema";
import * as Sentry from "@sentry/node";

export async function isFirstRun() {
  const vehicleDisponibilityCount = await db.$count(vehicleDisponibility);
  const incidentTypesCount = await db.$count(incidentTypes);
  const stationCount = await db.$count(stations);

  return vehicleDisponibilityCount === 0 || incidentTypesCount === 0 || stationCount === 0;
}

export async function initializeData() {
  logger.info("First run detected. Initializing data...");
  await Sentry.startSpan(
    {
      name: "initial-data-sync",
      op: "init.initial-data-sync"
    },
    async () => {
      logger.info("Syncing initial data");
      await syncStations();
      await syncIncidentTypes();
      await syncVehicleDisponibility();
      await syncVehicles();
      logger.info("Initial data sync complete");
    }
  );
}
