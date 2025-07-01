import { redis } from "@/config/redis";
import { syncVehicles } from "@/services/vehicles.service";
import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";

export const vehiclesWorker = new Worker(
  "vehicles",
  async () => {
    logger.info("Starting vehicles sync job");

    const result = await syncVehicles();

    if (result.isErr()) {
      const error = result.error;
      logger.error("Vehicles sync job failed", { error });
      throw new Error(JSON.stringify(error, null, 2));
    }

    logger.info(result.value);
    logger.info("Vehicles sync job completed successfully");

    return { processed: true };
  },
  {
    connection: redis,
    concurrency: 1,
    lockDuration: 15 * 60 * 1000 // 15 minutes
  }
);

vehiclesWorker.on("completed", (job) => {
  logger.info("Vehicles job completed", {
    jobId: job.id
  });
});

vehiclesWorker.on("failed", (_, err) => {
  logger.error(`Vehicles job failed: ${err.message}`, { err: err.stack });
});

vehiclesWorker.on("error", (err) => {
  logger.error(`Vehicles worker error: ${err.message}`);
});
