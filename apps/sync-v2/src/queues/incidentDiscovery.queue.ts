import { Queue } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

import { redis } from "@/config/redis";

export const incidentDiscoveryQueue = new Queue("incident-discovery", {
  connection: redis,
  telemetry: new BullMQOtel("sync-v2"),
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5
  }
});
