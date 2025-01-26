import db from "@/server/db";
import { type vehiclesInsertSchema, vehicles as vehiclesTable } from "@/server/db/schema";
import { getAllVehicles, getVehicleDetails } from "@/server/sigae/api";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import type { z } from "zod";
import { conflictUpdateSetAllColumns } from "../db/utils";

type VehicleType = z.infer<typeof vehiclesInsertSchema>;

export const syncVehicles = schedules.task({
  id: "sync-vehicles",
  cron: "0 */5 * * *",
  queue: {
    concurrencyLimit: 1
  },
  run: async () => {
    const vehiclesList = await getAllVehicles();
    const vehicles: VehicleType[] = [];

    for (const vehicle of vehiclesList.Items) {
      const detailedVehicle = await getVehicleDetails(vehicle.IdVehiculo);
      vehicles.push({
        id: vehicle.IdVehiculo,
        internalNumber: detailedVehicle.Numero_interno,
        plate: detailedVehicle.Placa,
        class: detailedVehicle.Des_clase_vehiculo,
        descriptionType: detailedVehicle.Des_tipo_vehiculo,
        stationId: detailedVehicle.Id_estacion,
        descriptionOperationalStatus: detailedVehicle.Des_estado_operativo
      });
    }

    logger.info(`Syncing ${vehicles.length} vehicles`);

    db.insert(vehiclesTable)
      .values(vehicles)
      .onConflictDoUpdate({
        target: vehiclesTable.id,
        set: conflictUpdateSetAllColumns(vehiclesTable)
      });

    return vehicles.length;
  }
});
