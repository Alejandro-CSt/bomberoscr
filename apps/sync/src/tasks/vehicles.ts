import db from "@bomberoscr/db/db";
import { type vehiclesInsertSchema, vehicles as vehiclesTable } from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import logger from "@bomberoscr/lib/logger";
import { getAllVehicles, getVehicleDetails } from "@bomberoscr/sigae/api";
import * as Sentry from "@sentry/node";
import type { z } from "zod";

type VehicleType = z.infer<typeof vehiclesInsertSchema>;

export async function syncVehicles() {
  const span = Sentry.getActiveSpan();
  logger.info("Starting vehicles sync");
  const vehiclesList = await getAllVehicles();
  span?.setAttribute("vehiclesList", vehiclesList.Items.length);
  logger.info(`Retrieved ${vehiclesList.Items.length} vehicles from API`);

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

  logger.info(`Processing ${vehicles.length} vehicles to database`);
  await db
    .insert(vehiclesTable)
    .values(vehicles)
    .onConflictDoUpdate({
      target: vehiclesTable.id,
      set: conflictUpdateSetAllColumns(vehiclesTable)
    });

  logger.info(`Vehicles sync completed - Count: ${vehicles.length}`);
  return vehicles.length;
}
