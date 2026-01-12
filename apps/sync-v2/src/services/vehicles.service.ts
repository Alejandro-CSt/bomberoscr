import { db } from "@bomberoscr/db/index";
import { vehicles as vehiclesTable } from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import { getAllVehicles, getVehicleDetails } from "@bomberoscr/sync-domain/api";
import { ResultAsync } from "neverthrow";

import { fetcher } from "@/config/fetcher";

export type VehicleSyncError = {
  type: "api_error" | "database_error";
  resource: string;
  error: unknown;
};

export function syncVehicles(): ResultAsync<string, VehicleSyncError> {
  return getAllVehicles({ fetcher })
    .mapErr(
      (error) =>
        ({
          type: "api_error",
          resource: "all_vehicles",
          error
        }) as const
    )
    .andThen((vehiclesList) => {
      const vehiclePromises = vehiclesList.Items.map((vehicle) =>
        getVehicleDetails({ fetcher, id: vehicle.IdVehiculo })
          .mapErr(
            (error) =>
              ({
                type: "api_error",
                resource: `vehicle_details:${vehicle.IdVehiculo}`,
                error
              }) as const
          )
          .map((detailedVehicle) => ({
            id: vehicle.IdVehiculo,
            internalNumber: detailedVehicle.Numero_interno,
            plate: detailedVehicle.Placa,
            class: detailedVehicle.Des_clase_vehiculo,
            descriptionType: detailedVehicle.Des_tipo_vehiculo,
            stationId: detailedVehicle.Id_estacion,
            descriptionOperationalStatus: detailedVehicle.Des_estado_operativo
          }))
      );

      return ResultAsync.combine(vehiclePromises).andThen((vehicles) => {
        return ResultAsync.fromPromise(
          db
            .insert(vehiclesTable)
            .values(vehicles)
            .onConflictDoUpdate({
              target: vehiclesTable.id,
              set: conflictUpdateSetAllColumns(vehiclesTable)
            }),
          (error) =>
            ({
              type: "database_error",
              resource: "syncVehicles",
              error
            }) as const
        ).map(() => `Synced ${vehicles.length} vehicles.`);
      });
    });
}

export function syncSingleVehicle(id: number): ResultAsync<string, VehicleSyncError> {
  return getVehicleDetails({ fetcher, id })
    .mapErr(
      (error) =>
        ({
          type: "api_error",
          resource: `vehicle_details:${id}`,
          error
        }) as const
    )
    .andThen((detailedVehicle) => {
      const vehicleRow = {
        id,
        internalNumber: detailedVehicle.Numero_interno,
        plate: detailedVehicle.Placa,
        class: detailedVehicle.Des_clase_vehiculo,
        descriptionType: detailedVehicle.Des_tipo_vehiculo,
        stationId: detailedVehicle.Id_estacion,
        descriptionOperationalStatus: detailedVehicle.Des_estado_operativo
      };

      return ResultAsync.fromPromise(
        db
          .insert(vehiclesTable)
          .values(vehicleRow)
          .onConflictDoUpdate({
            target: vehiclesTable.id,
            set: conflictUpdateSetAllColumns(vehiclesTable)
          }),
        (error) =>
          ({
            type: "database_error",
            resource: "syncSingleVehicle",
            error
          }) as const
      ).map(() => `Synced vehicle ${id}.`);
    });
}
