import { getAllVehicles, getVehicleDetails } from "@/server/api";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import fs from "node:fs";
import { vehicles as vehiclesSchema } from "../schema";
import vehiclesJson from "./data/vehicles.json";

export interface ObtenerEstadoDisponibilidadUnidades {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstadoDisponibilidadUnidades[];
}

export interface ItemObtenerEstadoDisponibilidadUnidades {
  Descripcion: string;
  IdGrupoClasificacion: number;
}

export interface ObtenerVehiculosComboF5 {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerVehiculosComboF5[];
}

export interface ItemObtenerVehiculosComboF5 {
  IdVehiculo: number;
  NumeroInterno: string;
}

export interface ObtenerDatosVehiculo {
  Codigo: string;
  Descripcion: string;
  Asignado_a: string;
  Canton: string;
  Capacidad: number;
  Clave_estacion_evolution: string;
  Des_clase_vehiculo: string;
  Des_estado_disponibilidad: string;
  Des_estado_operativo: string;
  Des_tipo_vehiculo: string;
  Distrito: string;
  Id_Estacion_Reporte: number;
  Id_canton: number;
  Id_clase_vehiculo: number;
  Id_distrito: number;
  Id_estacion: number;
  Id_estacion_transferido: number;
  Id_estado_disponibilidad: number;
  Id_estado_operativo: number;
  Id_personal: number;
  Id_personal_transferido: number;
  Id_provincia: number;
  Id_tipo_vehiculo: number;
  Id_veh_evo: string;
  Id_vehiculo: number;
  Ind_i_a: number;
  Numero_interno: string;
  Observaciones: string;
  Placa: string;
  Provincia: string;
  Transferido_a: string;
}

export interface ObtenerUnidadesDespachadasIncidente {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerUnidadesDespachadasIncidente[];
}

export interface ItemObtenerUnidadesDespachadasIncidente {
  Codigo: string | null;
  Descripcion: string | null;
  CodigoEstacion: number;
  CodigoUnidad: number;
  DespachoAlarma: boolean;
  HoraBase: string;
  HoraDespacho: string;
  HoraDevolverBase: string;
  HoraLLegada: string;
  HoraRetiro: string;
  HoraTraslado: string;
  IdBoletaServicio: number;
  IdBoletaUnidadDespachada: number;
  IdVehiculo: number;
  NumeroInterno: string | null;
  Traslado: boolean;
  Unidad: string;
  UnidadCompleta: string;
}

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

type VehicleType = typeof vehiclesSchema.$inferInsert;

export default async function seedVehicles(db: DrizzleD1Database) {
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
