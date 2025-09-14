import { redis } from "@/config/redis";
import { syncVehicleDisponibility } from "@/services/vehicleDisponibility.service";
import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

export const vehicleDisponibilityWorker = new Worker(
  "vehicleDisponibility",
  async () => {
    logger.info("Starting vehicle disponibility sync job");

    const result = await syncVehicleDisponibility();

    if (result.isErr()) {
      const error = result.error;
      logger.error("Vehicle disponibility sync job failed", { error });
      throw new Error(JSON.stringify(error, null, 2));
    }

    logger.info(result.value);
    logger.info("Vehicle disponibility sync job completed successfully");

    return { processed: true };
  },
  {
    connection: redis,
    telemetry: new BullMQOtel("sync-v2"),
    concurrency: 1,
    lockDuration: 15 * 60 * 1000 // 15 minutes
  }
);

vehicleDisponibilityWorker.on("completed", (job) => {
  logger.info("Vehicle disponibility job completed", {
    jobId: job.id
  });
});

vehicleDisponibilityWorker.on("failed", (_, err) => {
  logger.error(`Vehicle disponibility job failed: ${err.message}`, { err: err.stack });
});

vehicleDisponibilityWorker.on("error", (err) => {
  logger.error(`Vehicle disponibility worker error: ${err.message}`);
});
