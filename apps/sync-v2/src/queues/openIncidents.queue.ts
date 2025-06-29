import { redis } from "@/config/redis";
import { Queue } from "bullmq";

export const openIncidentsQueue = new Queue("open-incidents", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    }
  }
});
