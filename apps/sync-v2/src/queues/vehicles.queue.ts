import { redis } from "@/config/redis";
import { Queue } from "bullmq";

export const vehiclesQueue = new Queue("vehicles", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3 * 60 * 1000
    }
  }
});
