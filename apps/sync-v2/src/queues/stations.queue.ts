import { redis } from "@/config/redis";
import { Queue } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

export const stationsQueue = new Queue("stations", {
  connection: redis,
  telemetry: new BullMQOtel("sync-v2"),
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5 * 60 * 1000 // 5 minutes
    }
  }
});
