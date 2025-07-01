import { redis } from "@/config/redis";
import { syncDistricts } from "@/services/districts.service";
import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";

export const districtsWorker = new Worker(
  "districts",
  async () => {
    logger.info("Starting districts sync job");

    const result = await syncDistricts();

    if (result.isErr()) {
      const error = result.error;
      logger.error("Districts sync job failed", { error });
      throw new Error(JSON.stringify(error, null, 2));
    }

    logger.info(result.value);
    logger.info("Districts sync job completed successfully");

    return { processed: true };
  },
  {
    connection: redis,
    concurrency: 1,
    lockDuration: 15 * 60 * 1000 // 15 minutes
  }
);

districtsWorker.on("completed", (job) => {
  logger.info("Districts job completed", {
    jobId: job.id
  });
});

districtsWorker.on("failed", (_, err) => {
  logger.error(`Districts job failed: ${err.message}`, { err: err.stack });
});

districtsWorker.on("error", (err) => {
  logger.error(`Districts worker error: ${err.message}`);
});
