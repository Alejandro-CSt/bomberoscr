import { fetcher } from "@/config/fetcher";
import { db } from "@bomberoscr/db/db";
import {
  type vehicleDisponibilityInsertSchema,
  vehicleDisponibility as vehicleDisponibilityTable
} from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import { getVehicleDisponibilityStates } from "@bomberoscr/sync-domain/api";
import { ResultAsync } from "neverthrow";
import type { z } from "zod";

export type VehicleDisponibilitySyncError = {
  type: "api_error" | "database_error";
  resource: string;
  error: unknown;
};

type VehicleDisponibilityType = z.infer<typeof vehicleDisponibilityInsertSchema>;

export function syncVehicleDisponibility(): ResultAsync<string, VehicleDisponibilitySyncError> {
  return getVehicleDisponibilityStates({ fetcher })
    .mapErr(
      (error) =>
        ({
          type: "api_error",
          resource: "vehicle_disponibility_states",
          error
        }) as const
    )
    .andThen((vehicleDisponibilityStates) => {
      const vehicleDisponibility: VehicleDisponibilityType[] = vehicleDisponibilityStates.Items.map(
        (state) => ({
          id: state.IdGrupoClasificacion,
          description: state.Descripcion
        })
      );

      return ResultAsync.fromPromise(
        db
          .insert(vehicleDisponibilityTable)
          .values(vehicleDisponibility)
          .onConflictDoUpdate({
            target: vehicleDisponibilityTable.id,
            set: conflictUpdateSetAllColumns(vehicleDisponibilityTable)
          }),
        (error) =>
          ({
            type: "database_error",
            resource: "syncVehicleDisponibility",
            error
          }) as const
      ).map(() => `Synced ${vehicleDisponibility.length} vehicle disponibility states.`);
    });
}
