import * as cron from "node-cron";

import { syncIncidentTypes } from "./tasks/incident-types";
import { syncLatestIncidents, syncOpenIncidents } from "./tasks/incidents";
import { syncStations } from "./tasks/stations";
import { syncVehicleDisponibility } from "./tasks/vehicle-disponibility";
import { syncVehicles } from "./tasks/vehicles";

cron.schedule("* * * * *", async () => {
  await syncLatestIncidents();
});

cron.schedule("*/3 * * * *", async () => {
  await syncOpenIncidents();
});

cron.schedule("0 */12 * * *", async () => {
  await syncStations();
  await syncIncidentTypes();
  await syncVehicleDisponibility();
  await syncVehicles();
});
