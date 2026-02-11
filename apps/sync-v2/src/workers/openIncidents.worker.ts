import logger from "@bomberoscr/lib/logger";
import { Worker } from "bullmq";
import { BullMQOtel } from "bullmq-otel";

import { redis } from "@/config/redis";
import { metricsRegistry } from "@/config/telemetry";
import { openIncidentsQueue } from "@/queues/openIncidents.queue";
import { ERROR_MESSAGES, closeIncident, updateIncident } from "@/services/openIncidents.service";

export interface IncidentSyncJobData {
  incidentId: number;
}

interface IncidentSyncJobResult {
  incidentId: number;
  requeue:
    | {
        reason: string;
      }
    | false;
}

const worker = new Worker(
  "open-incidents",
  async (job): Promise<IncidentSyncJobResult> => {
    const start = Date.now();
    const { incidentId } = job.data as IncidentSyncJobData;

    await updateIncident({ id: incidentId }).orTee((error) => {
      logger.error(`Error updating incident ${incidentId}: ${error.message}`);
    });

    const closeIncidentResult = await closeIncident({ id: incidentId });

    if (closeIncidentResult.isErr()) {
      await openIncidentsQueue.add(
        "open-incident",
        { incidentId },
        {
          delay: 3 * 60_000,
          jobId: `open-incident-${incidentId}-${Date.now()}`
        }
      );
      metricsRegistry.jobDurationMs.record(Date.now() - start, { job: "open-incidents" });
      return {
        incidentId,
        requeue: {
          reason: ERROR_MESSAGES[closeIncidentResult.error.type] ?? closeIncidentResult.error.type
        }
      };
    }

    metricsRegistry.jobDurationMs.record(Date.now() - start, { job: "open-incidents" });
    return { incidentId, requeue: false };
  },
  {
    connection: redis,
    telemetry: new BullMQOtel("sync-v2"),
    concurrency: 5
  }
);

worker.on("completed", (_, returnValue: IncidentSyncJobResult) => {
  const message = returnValue.requeue
    ? `re-queued: ${returnValue.requeue.reason}`
    : "synced and closed";
  logger.info(`Incident ${returnValue.incidentId} ${message}.`);
});

worker.on("failed", (_, err) => {
  logger.error(`Incident sync job failed: ${err.message}`);
});

worker.on("error", (err) => {
  logger.error(`Incidents worker error: ${err.message}`);
});
