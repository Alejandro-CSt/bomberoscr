import db from "@/server/db";
import { type stationsInsertSchema, stations as stationsTable } from "@/server/db/schema";
import { conflictUpdateSetAllColumns } from "@/server/db/utils";
import { getOperativeStations, getStationDetails, getStationsList } from "@/server/sigae/api";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import type { z } from "zod";

type StationType = z.infer<typeof stationsInsertSchema>;

export const syncStations = schedules.task({
  id: "sync-stations",
  cron: "0 12 * * *",
  queue: {
    concurrencyLimit: 1
  },
  run: async () => {
    logger.info("Starting stations sync");
    const stationList = await getStationsList();
    logger.info(`Fetched ${stationList.Items.length} stations from listing`);
    const operativeStations = await getOperativeStations();
    logger.info(`Fetched ${operativeStations.Items.length} operative stations`);
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

    logger.info(`Syncing ${stations.length} stations`);
    await db
      .insert(stationsTable)
      .values(stations)
      .onConflictDoUpdate({
        target: stationsTable.id,
        set: conflictUpdateSetAllColumns(stationsTable)
      });
    logger.info("Stations updated in database");
    return stations.length;
  }
});
