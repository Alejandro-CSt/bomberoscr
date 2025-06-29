import { redis } from "@/config/redis";
import { openIncidentsQueue } from "@/queues/openIncidents.queue";
import { getNewIncidents } from "@/services/incidentDiscovery.service";
import type { IncidentSyncJobData } from "@/workers/openIncidents.worker";
import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";

export const worker = new Worker(
  "incidentDiscovery",
  async () => {
    const newIncidents = await getNewIncidents();

    if (newIncidents.isErr()) {
      logger.error(`Error fetching new incidents: ${newIncidents.error}`);
      return { processed: false, discoveredIncidents: 0 };
    }

    const newIncidentsIds = newIncidents.value;

    await openIncidentsQueue.addBulk(
      newIncidentsIds.map((incidentId) => ({
        name: "open-incident",
        data: { incidentId } as IncidentSyncJobData,
        opts: {
          deduplication: { id: incidentId.toString() },
          delay: 0
        }
      }))
    );

    logger.info("Added new incidents to queue", {
      discoveredIncidents: newIncidentsIds.length
    });

    return { processed: true, discoveredIncidents: newIncidentsIds.length };
  },
  {
    connection: redis
  }
);

worker.on("completed", (job) => {
  logger.info("Discovery job completed", {
    jobId: job.id,
    discoveredIncidents: job.returnvalue?.discoveredIncidents
  });
});

worker.on("failed", (job, err) => {
  logger.error("Discovery job failed", {
    jobId: job?.id,
    error: err.message
  });
});

worker.on("error", (err) => {
  logger.error("Discovery worker error", { error: err.message });
});
