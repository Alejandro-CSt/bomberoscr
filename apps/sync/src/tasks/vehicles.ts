import db from "@repo/db/db";
import { type vehiclesInsertSchema, vehicles as vehiclesTable } from "@repo/db/schema";
import { conflictUpdateSetAllColumns } from "@repo/db/utils";
import { getAllVehicles, getVehicleDetails } from "@repo/sigae/api";
import * as Sentry from "@sentry/node";
import type { z } from "zod";

type VehicleType = z.infer<typeof vehiclesInsertSchema>;

export async function syncVehicles() {
  Sentry.captureMessage("Starting vehicles sync");
  const vehiclesList = await getAllVehicles();
  Sentry.captureMessage(`Fetched vehicles list with ${vehiclesList.Items.length} items`);
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

  Sentry.captureMessage(`Syncing ${vehicles.length} vehicles`);
  await db
    .insert(vehiclesTable)
    .values(vehicles)
    .onConflictDoUpdate({
      target: vehiclesTable.id,
      set: conflictUpdateSetAllColumns(vehiclesTable)
    });
  Sentry.captureMessage("Vehicles updated in database");
  return vehicles.length;
}
