import { incidentDiscoveryQueue } from "@/queues/incidentDiscovery.queue";
import "@/workers/incidentDiscovery.worker";
import "@/workers/openIncidents.worker";
import logger from "@bomberoscr/lib/logger";
import { ResultAsync } from "neverthrow";

async function startDiscoveryScheduler() {
  await incidentDiscoveryQueue.upsertJobScheduler("incident-discovery-scheduler", {
    pattern: "* * * * *",
    startDate: new Date(Date.now())
  });
}

function main(): ResultAsync<void, Error> {
  logger.info("Starting sync service");

  return ResultAsync.fromPromise(
    startDiscoveryScheduler(),
    (_) => new Error("Failed to start discovery scheduler")
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
