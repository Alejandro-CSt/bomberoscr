import logger from "@bomberoscr/lib/logger";
import Redis from "ioredis";

import env from "@/config/env";

export const redis = new Redis(env.REDIS_URL, {
  enableReadyCheck: false,
  maxRetriesPerRequest: null
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

redis.on("ready", () => {
  logger.info("Redis ready");
});
