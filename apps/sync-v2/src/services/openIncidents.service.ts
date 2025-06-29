import { fetcher } from "@/config/fetcher";
import { db } from "@bomberoscr/db/db";
import { dispatchedVehicles, incidents } from "@bomberoscr/db/schema";
import {
  getIncidentDetails,
  getIncidentReport,
  getStationsAttendingIncident,
  getVehiclesDispatchedToIncident
} from "@bomberoscr/sync-domain/api";
import { upsertIncident } from "@bomberoscr/sync-domain/persist/upsertIncident";
import type {
  ObtenerEstacionesAtiendeIncidente,
  ObtenerUnidadesDespachadasIncidente
} from "@bomberoscr/sync-domain/types";
import { and, eq } from "drizzle-orm";
import { ResultAsync, okAsync } from "neverthrow";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function updateIncident({ id }: { id: number }) {
  return ResultAsync.combine([
    getIncidentDetails({ fetcher, id }),
    getIncidentReport({ fetcher, id }),
    getStationsAttendingIncident({ fetcher, id }),
    getVehiclesDispatchedToIncident({ fetcher, id })
  ]).andThen(([incidentDetails, incidentReport, stationsAttending, vehiclesDispatched]) => {
    return ResultAsync.fromPromise(
      upsertIncident({
        incidentId: id,
        incidentDetails,
        incidentReport,
        stationsAttending: (stationsAttending as unknown as ObtenerEstacionesAtiendeIncidente)
          .Items,
        vehiclesDispatched: (vehiclesDispatched as unknown as ObtenerUnidadesDespachadasIncidente)
          .Items
      }),
      (_) => new Error(`Error updating incident ${id}`)
    );
  });
}

/**
 * Checks if an incident is open.
 * An incident is open if it is older than 3 days and has no vehicles in scene.
 * @param incidentId - The ID of the incident to check.
 * @returns A ResultAsync containing a boolean indicating if the incident is open.
 */
export function isIncidentOpen({
  incidentId
}: { incidentId: number }): ResultAsync<boolean, Error> {
  const getIncident = () => {
    return ResultAsync.fromPromise(
      db.query.incidents.findFirst({
        where: eq(incidents.id, incidentId)
      }),
      (_) => new Error(`Error fetching incident ${incidentId} from DB`)
    );
  };

  const getVehiclesInScene = () => {
    return ResultAsync.fromPromise(
      db.query.dispatchedVehicles.findMany({
        where: and(
          eq(dispatchedVehicles.incidentId, incidentId),
          eq(dispatchedVehicles.departureTime, new Date("0001-01-01T00:00:00"))
        )
      }),
      (_) => new Error(`Error fetching vehicles in scene for incident ${incidentId} from DB`)
    );
  };

  return ResultAsync.combine([getIncident(), getVehiclesInScene()]).andThen(
    ([incident, vehiclesInScene]) => {
      if (!incident) return okAsync(false);

      const incidentAgeMs = Date.now() - new Date(incident.incidentTimestamp).getTime();

      if (incidentAgeMs < THREE_DAYS_MS) return okAsync(false);

      if (vehiclesInScene.length > 0) return okAsync(false);

      return okAsync(true);
    }
  );
}
