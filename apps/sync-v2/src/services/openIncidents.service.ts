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
import { ResultAsync, errAsync, okAsync } from "neverthrow";

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
      () => new Error(`Error updating incident ${id}`)
    );
  });
}

export type CloseIncidentError = {
  type: "no_coordinates" | "vehicles_in_scene" | "not_found" | "database_error";
};

export const ERROR_MESSAGES: Record<CloseIncidentError["type"], string> = {
  no_coordinates: "No coordinates",
  vehicles_in_scene: "Vehicles still in scene",
  not_found: "Not found",
  database_error: "Database error"
};

/**
 * Closes the incident unless it is too recent or if there are still vehicles in scene.
 * @param id - The id of the incident to close.
 * @returns A result indicating whether the incident was closed successfully.
 */
export async function closeIncident({
  id
}: { id: number }): Promise<ResultAsync<void, CloseIncidentError>> {
  const incidentQuery = db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    columns: {
      incidentTimestamp: true,
      latitude: true,
      longitude: true
    }
  });
  const vehiclesInSceneQuery = db.query.dispatchedVehicles.findMany({
    where: and(
      eq(dispatchedVehicles.incidentId, id),
      eq(dispatchedVehicles.departureTime, new Date("0001-01-01T00:00:00"))
    ),
    columns: {
      departureTime: true
    }
  });

  return ResultAsync.combine([
    ResultAsync.fromPromise(
      incidentQuery,
      () => ({ type: "database_error" }) as CloseIncidentError
    ),
    ResultAsync.fromPromise(
      vehiclesInSceneQuery,
      () => ({ type: "database_error" }) as CloseIncidentError
    )
  ])
    .andThen(([incident, vehiclesInScene]) => {
      if (!incident) return errAsync({ type: "not_found" } as CloseIncidentError);

      // If the incident is older than three days, close it regardless of other conditions
      const threeDaysAgo = new Date(Date.now() - THREE_DAYS_MS);
      if (incident.incidentTimestamp < threeDaysAgo) {
        return okAsync(id);
      }

      if (incident.latitude === "0" || incident.longitude === "0")
        return errAsync({ type: "no_coordinates" } as CloseIncidentError);

      if (vehiclesInScene.length > 0)
        return errAsync({ type: "vehicles_in_scene" } as CloseIncidentError);

      return okAsync(id);
    })
    .andThen((id) => {
      return ResultAsync.fromPromise(
        db.update(incidents).set({ isOpen: false }).where(eq(incidents.id, id)),
        () => ({ type: "database_error" }) as CloseIncidentError
      ).map(() => undefined);
    });
}
