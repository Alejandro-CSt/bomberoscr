import fs from "node:fs";
import { getStationDetails, getStationsList } from "@/server/api";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { stations as stationsSchema } from "../schema";
import stationsJson from "./data/stations.json";

export interface ObtenerEstacionLista {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstacionLista[];
}

export interface ItemObtenerEstacionLista {
  ClaveEstacion: string;
  IdEstacion: number;
  Latitud: number;
  Longitud: number;
  Nombre: string;
  Telefono: string;
}

export interface ObtenerEstacionDetalle {
  Codigo: string;
  Descripcion: string;
  CanalRadio: string;
  ClaveEstacion: string;
  Direccion: string;
  Email: string;
  Fax: string;
  IdEstacion: number;
  Latitud: number;
  Longitud: number;
  Nombre: string;
  Telefono: string;
}

export interface ObtenerEstacionesOperativas {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstacionesOperativas[];
}

export interface ItemObtenerEstacionesOperativas {
  ClaveEstacion: string;
  IdEstacion: number;
  Nombre: string;
}

export interface ObtenerEstacionesAtiendeIncidente {
  Codigo: string;
  Descripcion: string;
  Items: ItemObtenerEstacionesAtiendeIncidente[];
}

export interface ItemObtenerEstacionesAtiendeIncidente {
  Codigo: string | null;
  Descripcion: string | null;
  AtencionAPie: boolean;
  ClaveEstacion: string;
  DestipoServicio: string;
  HoraAtencionAPie: string;
  IdBoletaEstacionAtiende: number;
  IdEstacion: number;
  IdTipoServicio: number;
  NombreEstacion: string;
}

type StationType = typeof stationsSchema.$inferInsert;

export async function saveStationsToJSON() {
  const stationList = await getStationsList();
  const stations: StationType[] = [];
  for (const station of stationList.Items) {
    const detailedStation = await getStationDetails(station.IdEstacion);
    stations.push({
      id: station.IdEstacion,
      name: station.Nombre,
      stationKey: station.ClaveEstacion,
      radioChannel: detailedStation.CanalRadio,
      latitude: station.Latitud,
      longitude: station.Longitud,
      address: detailedStation.Direccion,
      phoneNumber: station.Telefono,
      fax: detailedStation.Fax,
      email: detailedStation.Email
    });
    console.log("Station saved", detailedStation, stations.length);
  }
  fs.writeFileSync("src/server/db/seeds/data/stations.json", JSON.stringify(stations, null, 2));
}

export default async function seedStations(db: DrizzleD1Database) {
  const stations: StationType[] = stationsJson.map((station) => ({
    id: station.id,
    name: station.name,
    stationKey: station.stationKey,
    radioChannel: station.radioChannel,
    latitude: station.latitude,
    longitude: station.longitude,
    address: station.address,
    phoneNumber: station.phoneNumber,
    fax: station.fax,
    email: station.email
  }));
  await db.insert(stationsSchema).values(stations);
}
