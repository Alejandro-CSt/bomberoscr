import { getAllVehicles, getVehicleDetails } from "@/server/api";
import db from "@/server/db/index";
import { type vehiclesInsertSchema, vehicles as vehiclesSchema } from "@/server/db/schema";
import vehiclesJson from "@/server/db/seeds/data/vehicles.json";
import type { ObtenerDatosVehiculo } from "@/server/sigae/types";
import fs from "node:fs";
import type { z } from "zod";

export async function createVehiclesJSON() {
  const allVehicles = await getAllVehicles();
  console.log(allVehicles.Items.length);
  const fullVehicles: ObtenerDatosVehiculo[] = [];

  for (const vehicle of allVehicles.Items) {
    fullVehicles.push(await getVehicleDetails(vehicle.IdVehiculo));
    console.log(fullVehicles, fullVehicles.length);
  }

  fs.writeFileSync("src/server/db/seed/data/vehicles.json", JSON.stringify(fullVehicles, null, 2));
}

type VehicleType = z.infer<typeof vehiclesInsertSchema>;

export default async function seedVehicles() {
  const vehicles: VehicleType[] = vehiclesJson.map((vehicle) => ({
    id: vehicle.Id_vehiculo,
    internalNumber: vehicle.Numero_interno,
    plate: vehicle.Placa,
    stationId: vehicle.Id_estacion,
    descriptionType: vehicle.Des_tipo_vehiculo,
    class: vehicle.Des_clase_vehiculo,
    descriptionOperationalStatus: vehicle.Des_estado_operativo
  }));
  await db.insert(vehiclesSchema).values(vehicles);
}
