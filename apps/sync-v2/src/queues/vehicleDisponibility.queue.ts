import { redis } from "@/config/redis";
import { Queue } from "bullmq";

export const vehicleDisponibilityQueue = new Queue("vehicleDisponibility", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60 * 1000 // 1 minute
    }
  }
});
