import { redis } from "@/config/redis";
import { openIncidentsQueue } from "@/queues/openIncidents.queue";
import { isIncidentOpen, updateIncident } from "@/services/openIncidents.service";
import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";

export interface IncidentSyncJobData {
  incidentId: number;
}

const worker = new Worker(
  "open-incidents",
  async (job) => {
    const { incidentId } = job.data as IncidentSyncJobData;

    const updateResult = await updateIncident({ id: incidentId });
    const isOpen = await isIncidentOpen({ incidentId });

    if (updateResult.isErr() || (isOpen.isOk() && isOpen.value === true)) {
      // Re-queue the job if the incident is open (with 3 minute delay)
      await openIncidentsQueue.add("open-incident", { incidentId }, { delay: 3 * 60 * 1000 });
    }

    return { incidentId };
  },
  {
    connection: redis,
    concurrency: 5
  }
);

worker.on("completed", (job) => {
  const result: IncidentSyncJobData = job.returnvalue;
  logger.info(`Incident ${result.incidentId} updated.`);
});

worker.on("failed", (_, err) => {
  logger.error(`Incident sync job failed: ${err.message}`);
});

worker.on("error", (err) => {
  logger.error(`Incidents worker error: ${err.message}`);
});
