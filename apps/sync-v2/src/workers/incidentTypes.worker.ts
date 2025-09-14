import { redis } from "@/config/redis";
import { syncIncidentTypes } from "@/services/incidentTypes.service";
import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

export const incidentTypesWorker = new Worker(
  "incidentTypes",
  async () => {
    logger.info("Starting incident types sync job");

    const result = await syncIncidentTypes();

    if (result.isErr()) {
      const error = result.error;
      logger.error("Incident types sync job failed", { error });
      throw new Error(JSON.stringify(error, null, 2));
    }

    logger.info(result.value);
    logger.info("Incident types sync job completed successfully");

    return { processed: true };
  },
  {
    connection: redis,
    telemetry: new BullMQOtel("sync-v2"),
    concurrency: 1,
    lockDuration: 15 * 60 * 1000 // 15 minutes
  }
);

incidentTypesWorker.on("completed", (job) => {
  logger.info("Incident types job completed", {
    jobId: job.id
  });
});

incidentTypesWorker.on("failed", (_, err) => {
  logger.error(`Incident types job failed: ${err.message}`, { err: err.stack });
});

incidentTypesWorker.on("error", (err) => {
  logger.error(`Incident types worker error: ${err.message}`);
});
