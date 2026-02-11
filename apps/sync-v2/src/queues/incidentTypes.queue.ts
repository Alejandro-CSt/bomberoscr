import { Queue } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

import { redis } from "@/config/redis";

export const incidentTypesQueue = new Queue("incidentTypes", {
  connection: redis,
  telemetry: new BullMQOtel("sync-v2"),
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3 * 60 * 1000 // 5 minutes
    }
  }
});
