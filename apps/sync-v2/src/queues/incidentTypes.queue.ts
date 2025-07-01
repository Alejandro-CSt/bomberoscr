import { redis } from "@/config/redis";
import { Queue } from "bullmq";

export const incidentTypesQueue = new Queue("incidentTypes", {
  connection: redis,
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
