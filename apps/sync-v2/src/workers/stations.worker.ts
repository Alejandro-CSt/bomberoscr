import { fetcher } from "@/config/fetcher";
import { redis } from "@/config/redis";
import { stationsQueue } from "@/queues/stations.queue";
import { syncSingleStation } from "@/services/stations.service";
import logger from "@bomberoscr/lib/logger";
import { getOperativeStations, getStationsList } from "@bomberoscr/sync-domain/api";
import { Worker } from "bullmq";
import { BullMQOtel } from "bullmq-otel";
import { ResultAsync } from "neverthrow";

type StationListResponse = {
  Items: Array<{ IdEstacion: number; Nombre: string; ClaveEstacion: string }>;
};
type OperativeStationsResponse = { Items: Array<{ IdEstacion: number }> };

export const stationsWorker = new Worker(
  "stations",
  async (job) => {
    if (job.name === "stations:seed" || job.name === "stations-scheduler") {
      logger.info("Seeding stations jobs");
      const combined = await ResultAsync.combine([
        getStationsList({ fetcher }).mapErr(
          (error) => ({ type: "api_error", resource: "stations_list", error }) as const
        ),
        getOperativeStations({ fetcher }).mapErr(
          (error) => ({ type: "api_error", resource: "operative_stations", error }) as const
        )
      ]).match(
        ([stationList, operativeStations]) =>
          Promise.resolve({ ok: true as const, stationList, operativeStations }),
        (error) => Promise.resolve({ ok: false as const, error })
      );
      if (!combined.ok) {
        const error = combined.error;
        logger.error("Stations seed failed", { error });
        throw new Error(JSON.stringify(error, null, 2));
      }
      const stationList = combined.stationList as StationListResponse;
      const operativeStations = combined.operativeStations as OperativeStationsResponse;
      const operativeSet = new Set<number>(operativeStations.Items.map((s) => s.IdEstacion));
      for (const s of stationList.Items) {
        const id = s.IdEstacion;
        const isOperative = operativeSet.has(id);
        await stationsQueue.add(
          "stations:upsert",
          { id, isOperative, name: s.Nombre, stationKey: s.ClaveEstacion },
          { jobId: `station:${id}` }
        );
      }
      logger.info("Stations seed completed");
      return { seeded: true };
    }

    if (job.name === "stations:upsert") {
      const { id, isOperative, name, stationKey } = job.data as {
        id: number;
        isOperative: boolean;
        name: string;
        stationKey: string;
      };
      logger.info(`Upserting station ${id}`);
      const result = await syncSingleStation(id, isOperative, name, stationKey);
      if (result.isErr()) {
        const error = result.error;
        logger.error("Stations upsert failed", { error });
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

stationsWorker.on("completed", (job) => {
  logger.info("Stations job completed", {
    jobId: job.id
  });
});

stationsWorker.on("failed", (_, err) => {
  logger.error(`Stations job failed: ${err.message}`, { err: err.stack });
});

stationsWorker.on("error", (err) => {
  logger.error(`Stations worker error: ${err.message}`);
});
