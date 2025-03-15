import db from "@/server/db";
import { type vehiclesInsertSchema, vehicles as vehiclesTable } from "@/server/db/schema";
import { conflictUpdateSetAllColumns } from "@/server/db/utils";
import { getAllVehicles, getVehicleDetails } from "@/server/sigae/api";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import type { z } from "zod";

type VehicleType = z.infer<typeof vehiclesInsertSchema>;

export const syncVehicles = schedules.task({
  id: "sync-vehicles",
  cron: "0 */5 * * *",
  queue: {
    concurrencyLimit: 1
  },
  run: async () => {
    logger.info("Starting vehicles sync");
    const vehiclesList = await getAllVehicles();
    logger.info(`Fetched vehicles list with ${vehiclesList.Items.length} items`);
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

    await db
      .insert(vehiclesTable)
      .values(vehicles)
      .onConflictDoUpdate({
        target: vehiclesTable.id,
        set: conflictUpdateSetAllColumns(vehiclesTable)
      });
    logger.info("Vehicles updated in database");
    return vehicles.length;
  }
});
