import { redis } from "@/config/redis";
import { Queue } from "bullmq";

export const metadataQueue = new Queue("metadata", {
  connection: redis
});
