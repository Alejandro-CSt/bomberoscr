import { fetcher } from "@/config/fetcher";
import { db } from "@bomberoscr/db/index";
import { stations as stationsTable } from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import {
  getOperativeStations,
  getStationDetails,
  getStationsList
} from "@bomberoscr/sync-domain/api";
import { ResultAsync } from "neverthrow";

export type StationSyncError = {
  type: "api_error" | "database_error";
  resource: string;
  error: unknown;
};

export function syncStations(): ResultAsync<string, StationSyncError> {
  return ResultAsync.combine([
    getStationsList({ fetcher }).mapErr(
      (error) =>
        ({
          type: "api_error",
          resource: "stations_list",
          error
        }) as const
    ),
    getOperativeStations({ fetcher }).mapErr(
      (error) =>
        ({
          type: "api_error",
          resource: "operative_stations",
          error
        }) as const
    )
  ]).andThen(([stationList, operativeStations]) => {
    const stationDetailPromises = stationList.Items.map((station) => {
      return getStationDetails({ fetcher, id: station.IdEstacion })
        .mapErr(
          (error) =>
            ({
              type: "api_error",
              resource: `station_details:${station.IdEstacion}`,
              error
            }) as const
        )
        .map((detailedStation) => {
          const isOperative = operativeStations.Items.some(
            (operativeStation) => operativeStation.IdEstacion === station.IdEstacion
          );
          return {
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
          };
        });
    });

    return ResultAsync.combine(stationDetailPromises).andThen((stations) => {
      return ResultAsync.fromPromise(
        db
          .insert(stationsTable)
          .values(stations)
          .onConflictDoUpdate({
            target: stationsTable.id,
            set: conflictUpdateSetAllColumns(stationsTable)
          }),
        (error) =>
          ({
            type: "database_error",
            resource: "syncStations",
            error
          }) as const
      ).map(() => `Synced ${stations.length} stations.`);
    });
  });
}
