import logger from "@bomberoscr/lib/logger";
import { getAllVehicles } from "@bomberoscr/sync-domain/api";
import { Worker } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

import { fetcher } from "@/config/fetcher";
import { redis } from "@/config/redis";
import { vehiclesQueue } from "@/queues/vehicles.queue";
import { syncSingleVehicle } from "@/services/vehicles.service";

type VehiclesListResponse = { Items: Array<{ IdVehiculo: number }> };

export const vehiclesWorker = new Worker(
  "vehicles",
  async (job) => {
    if (job.name === "vehicles:seed" || job.name === "vehicles-scheduler") {
      logger.info("Seeding vehicles jobs");
      const listResult = await getAllVehicles({ fetcher })
        .mapErr((error) => ({ type: "api_error", resource: "all_vehicles", error }) as const)
        .match(
          (vehiclesList) => Promise.resolve({ ok: true as const, vehiclesList }),
          (error) => Promise.resolve({ ok: false as const, error })
        );
      if (!listResult.ok) {
        const error = listResult.error;
        logger.error("Vehicles seed failed", { error });
        throw new Error(JSON.stringify(error, null, 2));
      }
      const vehiclesList = listResult.vehiclesList as VehiclesListResponse;
      for (const vehicle of vehiclesList.Items) {
        await vehiclesQueue.add(
          "vehicles:upsert",
          { id: vehicle.IdVehiculo },
          { jobId: `vehicle:${vehicle.IdVehiculo}` }
        );
      }
      logger.info("Vehicles seed completed");
      return { seeded: true };
    }

    if (job.name === "vehicles:upsert") {
      const { id } = job.data as { id: number };
      logger.info(`Upserting vehicle ${id}`);
      const result = await syncSingleVehicle(id);
      if (result.isErr()) {
        const error = result.error;
        logger.error("Vehicles upsert failed", { error });
        throw new Error(JSON.stringify(error, null, 2));
      }
      logger.info(result.value);
      return { processed: true };
    }

    return { skipped: true };
  },
  {
    connection: redis,
    telemetry: new BullMQOtel("sync-v2"),
    concurrency: 5,
    lockDuration: 15 * 60 * 1000
  }
);

vehiclesWorker.on("completed", (job) => {
  logger.info("Vehicles job completed", {
    jobId: job.id
  });
});

vehiclesWorker.on("failed", (_, err) => {
  logger.error(`Vehicles job failed: ${err.message}`, { err: err.stack });
});

vehiclesWorker.on("error", (err) => {
  logger.error(`Vehicles worker error: ${err.message}`);
});
