import { districtsQueue } from "@/queues/districts.queue";
import { incidentDiscoveryQueue } from "@/queues/incidentDiscovery.queue";
import { incidentTypesQueue } from "@/queues/incidentTypes.queue";
import { stationsQueue } from "@/queues/stations.queue";
import { vehicleDisponibilityQueue } from "@/queues/vehicleDisponibility.queue";
import { vehiclesQueue } from "@/queues/vehicles.queue";
import "@/workers/districts.worker";
import "@/workers/incidentDiscovery.worker";
import "@/workers/incidentTypes.worker";
import "@/workers/openIncidents.worker";
import "@/workers/stations.worker";
import "@/workers/vehicleDisponibility.worker";
import "@/workers/vehicles.worker";
import logger from "@bomberoscr/lib/logger";
import { ResultAsync } from "neverthrow";

async function startDiscoveryScheduler() {
  await incidentDiscoveryQueue.add(
    "incident-discovery-scheduler",
    {},
    {
      delay: 60_000,
      repeat: {
        pattern: "* * * * *"
      },
      jobId: "incident-discovery-scheduler"
    }
  );
}

async function startDistrictsScheduler() {
  const jobSchedulers = await districtsQueue.getJobSchedulers();
  if (
    jobSchedulers.every(
      (job) => job.id !== "districts-scheduler" && job.key !== "districts-scheduler"
    )
  ) {
    await districtsQueue.add(
      "districts-scheduler",
      {},
      {
        repeat: {
          pattern: "0 */12 * * *"
        },
        jobId: "districts-scheduler"
      }
    );
  }
}

async function startIncidentTypesScheduler() {
  const jobSchedulers = await incidentTypesQueue.getJobSchedulers();
  if (
    jobSchedulers.every(
      (job) => job.id !== "incident-types-scheduler" && job.key !== "incident-types-scheduler"
    )
  ) {
    await incidentTypesQueue.add(
      "incident-types-scheduler",
      {},
      {
        repeat: {
          pattern: "0 */12 * * *"
        },
        jobId: "incident-types-scheduler"
      }
    );
  }
}

async function startStationsScheduler() {
  const jobSchedulers = await stationsQueue.getJobSchedulers();
  if (
    jobSchedulers.every(
      (job) => job.id !== "stations-scheduler" && job.key !== "stations-scheduler"
    )
  ) {
    await stationsQueue.add(
      "stations:seed",
      {},
      {
        repeat: {
          pattern: "0 */12 * * *"
        },
        jobId: "stations-scheduler"
      }
    );
  }
}

async function startVehicleDisponibilityScheduler() {
  const jobSchedulers = await vehicleDisponibilityQueue.getJobSchedulers();
  if (
    jobSchedulers.every(
      (job) =>
        job.id !== "vehicle-disponibility-scheduler" &&
        job.key !== "vehicle-disponibility-scheduler"
    )
  ) {
    await vehicleDisponibilityQueue.add(
      "vehicle-disponibility-scheduler",
      {},
      {
        repeat: {
          pattern: "0 */12 * * *"
        },
        jobId: "vehicle-disponibility-scheduler"
      }
    );
  }
}

async function startVehiclesScheduler() {
  const jobSchedulers = await vehiclesQueue.getJobSchedulers();
  if (
    jobSchedulers.every(
      (job) => job.id !== "vehicles-scheduler" && job.key !== "vehicles-scheduler"
    )
  ) {
    await vehiclesQueue.add(
      "vehicles:seed",
      {},
      {
        repeat: {
          pattern: "0 */12 * * *"
        },
        jobId: "vehicles-scheduler"
      }
    );
  }
}

function main(): ResultAsync<void, Error> {
  logger.info("Starting sync service");

  return ResultAsync.fromPromise(
    Promise.all([
      startDiscoveryScheduler(),
      startDistrictsScheduler(),
      startIncidentTypesScheduler(),
      startStationsScheduler(),
      startVehicleDisponibilityScheduler(),
      startVehiclesScheduler()
    ]),
    (_) => new Error("Failed to start schedulers")
  ).map(() => {
    logger.info("Sync service started successfully");
  });
}

main().match(
  () => {},
  (error: Error) => {
    logger.error("Failed to start sync service", { error });
    process.exit(1);
  }
);
