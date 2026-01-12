import db from "@bomberoscr/db/db";
import { type stationsInsertSchema, stations as stationsTable } from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import logger from "@bomberoscr/lib/logger";
import { getOperativeStations, getStationDetails, getStationsList } from "@bomberoscr/sigae/api";
import * as Sentry from "@sentry/node";

import type { z } from "zod";

type StationType = z.infer<typeof stationsInsertSchema>;

export async function syncStations() {
  const span = Sentry.getActiveSpan();
  logger.info("Starting stations sync");
  const stationList = await getStationsList();
  span?.setAttribute("stationList", stationList.Items.length);
  logger.info(`Retrieved ${stationList.Items.length} stations from API`);

  const operativeStations = await getOperativeStations();
  span?.setAttribute("operativeStations", operativeStations.Items.length);
  logger.info(`Retrieved ${operativeStations.Items.length} operative stations`);

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

  logger.info(`Processing ${stations.length} stations to database`);
  await db
    .insert(stationsTable)
    .values(stations)
    .onConflictDoUpdate({
      target: stationsTable.id,
      set: conflictUpdateSetAllColumns(stationsTable)
    });

  logger.info(`Stations sync completed - Count: ${stations.length}`);
  return stations.length;
}
