import db from "@/server/db";
import { type stationsInsertSchema, stations as stationsTable } from "@/server/db/schema";
import { getOperativeStations, getStationDetails, getStationsList } from "@/server/sigae/api";
import { schedules } from "@trigger.dev/sdk/v3";
import type { z } from "zod";
import { conflictUpdateSetAllColumns } from "../db/utils";

type StationType = z.infer<typeof stationsInsertSchema>;

export const syncStations = schedules.task({
  id: "sync-stations",
  cron: "0 12 * * *",
  run: async () => {
    const stationList = await getStationsList();
    const operativeStations = await getOperativeStations();
    const stations: StationType[] = [];

    for (const station of stationList.Items) {
      const detailedStation = await getStationDetails(station.IdEstacion);
      const isOperative = operativeStations.Items.some(
        (operativeStation) => operativeStation.IdEstacion === station.IdEstacion
      );
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
        isOperative: isOperative
      });
    }

    db.insert(stationsTable)
      .values(stations)
      .onConflictDoUpdate({
        target: stationsTable.id,
        set: conflictUpdateSetAllColumns(stationsTable)
      });

    return stations.length;
  }
});
