import { Queue } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

import { redis } from "@/config/redis";

export const vehiclesQueue = new Queue("vehicles", {
  connection: redis,
  telemetry: new BullMQOtel("sync-v2"),
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3 * 60 * 1000
    }
  }
});
