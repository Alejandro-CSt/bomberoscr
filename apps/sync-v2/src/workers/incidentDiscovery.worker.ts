import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

import { redis } from "@/config/redis";
import { metricsRegistry } from "@/config/telemetry";
import { openIncidentsQueue } from "@/queues/openIncidents.queue";
import { getNewIncidents } from "@/services/incidentDiscovery.service";

import type { IncidentSyncJobData } from "@/workers/openIncidents.worker";

export const worker = new Worker(
  "incident-discovery",
  async () => {
    const start = Date.now();
    const newIncidents = await getNewIncidents();

    if (newIncidents.isErr()) {
      logger.error(`Error fetching new incidents: ${newIncidents.error}`);
      return { processed: false, discoveredIncidents: 0 };
    }

    const newIncidentsIds = newIncidents.value;

    if (newIncidentsIds.length === 0) {
      metricsRegistry.jobDurationMs.record(Date.now() - start, {
        job: "incident-discovery"
      });
      metricsRegistry.incidentsDiscovered.add(0);
      return { processed: true, discoveredIncidents: 0 };
    }

    await openIncidentsQueue.addBulk(
      newIncidentsIds.map((incidentId) => ({
        name: "open-incident",
        data: { incidentId } as IncidentSyncJobData,
        opts: {
          jobId: `open-incident-${incidentId}`,
          delay: 0
        }
      }))
    );

    metricsRegistry.jobDurationMs.record(Date.now() - start, {
      job: "incident-discovery"
    });
    metricsRegistry.incidentsDiscovered.add(newIncidentsIds.length);
    return { processed: true, discoveredIncidents: newIncidentsIds.length };
  },
  {
    connection: redis,
    telemetry: new BullMQOtel("sync-v2")
  }
);

worker.on("completed", (job) => {
  const discoveredIncidents: number = job.returnvalue?.discoveredIncidents ?? 0;

  const message =
    discoveredIncidents === 0
      ? "Discovery job completed - no incidents found"
      : `Discovery job completed - ${discoveredIncidents} new incidents found`;

  logger.info(message, {
    jobId: job.id,
    discoveredIncidents
  });
});

worker.on("failed", (_, err) => {
  logger.error(`Discovery job failed: ${err.message}, ${err.stack}`);
});

worker.on("error", (err) => {
  logger.error(`Discovery worker error: ${err.message}`);
});
