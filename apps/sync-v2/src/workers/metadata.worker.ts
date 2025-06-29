import { redis } from "@/config/redis";
import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";

export function createMetadataWorker() {
  const worker = new Worker(
    "metadata",
    async (job) => {
      logger.info("Processing metadata job", job.data);
    },
    {
      connection: redis
    }
  );

  worker.on("completed", (job) => {
    logger.info("Metadata job completed", job.id);
  });
}
