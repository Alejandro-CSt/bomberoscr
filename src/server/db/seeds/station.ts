import { getStationDetails, getStations, getStationsList } from "@/server/api";
import db from "@/server/db/index";
import fs from "node:fs";
import type { z } from "zod";
import { type stationsInsertSchema, stations as stationsSchema } from "../schema";
import stationsJson from "./data/stations.json";

type StationType = z.infer<typeof stationsInsertSchema>;

export async function saveStationsToJSON() {
  const stationList = await getStations();
  const operativeStations = await getStationsList();

  const stations: StationType[] = [];
  for (const station of stationList.Items) {
    const detailedStation = await getStationDetails(station.IdEstacion);
    stations.push({
      id: station.IdEstacion,
      name: station.Nombre,
      stationKey: station.ClaveEstacion,
      radioChannel: detailedStation.CanalRadio,
      latitude: detailedStation.Latitud.toString(),
      longitude: detailedStation.Longitud.toString(),
      address: detailedStation.Direccion,
      phoneNumber: detailedStation.Telefono,
      fax: detailedStation.Fax,
      email: detailedStation.Email,
      isOperative: operativeStations.Items.some(
        (operativeStation) => operativeStation.IdEstacion === station.IdEstacion
      )
    });
    console.log("Station saved", detailedStation, stations.length);
  }
  fs.writeFileSync("src/server/db/seeds/data/stations.json", JSON.stringify(stations, null, 2));
}

export default async function seedStations() {
  const stations: StationType[] = stationsJson.map((station) => ({
    id: station.id,
    name: station.name,
    stationKey: station.stationKey,
    radioChannel: station.radioChannel,
    latitude: station.latitude.toString(),
    longitude: station.longitude.toString(),
    address: station.address,
    phoneNumber: station.phoneNumber,
    fax: station.fax,
    email: station.email,
    isOperative: station.isOperative
  }));
  await db.insert(stationsSchema).values(stations).onConflictDoNothing();
}
