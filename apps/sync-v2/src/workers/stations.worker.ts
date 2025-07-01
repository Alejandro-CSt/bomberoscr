import { redis } from "@/config/redis";
import { syncStations } from "@/services/stations.service";
import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";

export const stationsWorker = new Worker(
  "stations",
  async () => {
    logger.info("Starting stations sync job");

    const result = await syncStations();

    if (result.isErr()) {
      const error = result.error;
      logger.error("Stations sync job failed", { error });
      throw new Error(JSON.stringify(error, null, 2));
    }

    logger.info(result.value);
    logger.info("Stations sync job completed successfully");

    return { processed: true };
  },
  {
    connection: redis,
    concurrency: 1,
    lockDuration: 15 * 60 * 1000 // 15 minutes
  }
);

stationsWorker.on("completed", (job) => {
  logger.info("Stations job completed", {
    jobId: job.id
  });
});

stationsWorker.on("failed", (_, err) => {
  logger.error(`Stations job failed: ${err.message}`, { err: err.stack });
});

stationsWorker.on("error", (err) => {
  logger.error(`Stations worker error: ${err.message}`);
});
