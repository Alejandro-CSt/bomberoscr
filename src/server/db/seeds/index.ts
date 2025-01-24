import seedIncidentTypes from "@/server/db/seeds/incident-types";
import seedStations from "@/server/db/seeds/station";
import seedVehicles from "@/server/db/seeds/vehicle";
import seedVehicleDisponibility from "@/server/db/seeds/vehicle-disponibility";

async function main() {
  await seedStations();
  await seedIncidentTypes();
  await seedVehicleDisponibility();
  await seedVehicles();
}

main();
