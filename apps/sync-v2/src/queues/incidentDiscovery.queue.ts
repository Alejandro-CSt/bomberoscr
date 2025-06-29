import { redis } from "@/config/redis";
import { Queue } from "bullmq";

export const incidentDiscoveryQueue = new Queue("incidentDiscovery", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5
  }
});
