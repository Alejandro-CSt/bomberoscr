import { fetcher } from "@/config/fetcher";
import { db } from "@bomberoscr/db/index";
import { cantons, districts, provinces } from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import { getCantonsList, getDistrictsList, getProvincesList } from "@bomberoscr/sync-domain/api";
import { ResultAsync } from "neverthrow";

export type DistrictSyncError = {
  type: "api_error" | "database_error";
  resource: string;
  error: unknown;
};

export function syncDistricts(): ResultAsync<string, DistrictSyncError> {
  return ResultAsync.combine([
    getProvincesList({ fetcher }).mapErr(
      (error) => ({ type: "api_error", resource: "provinces", error }) as const
    ),
    getCantonsList({ fetcher }).mapErr(
      (error) => ({ type: "api_error", resource: "cantons", error }) as const
    ),
    getDistrictsList({ fetcher }).mapErr(
      (error) => ({ type: "api_error", resource: "districts", error }) as const
    )
  ]).andThen(([provinceList, cantonList, districtsList]) => {
    return ResultAsync.fromPromise(
      db.transaction(async (tx) => {
        await Promise.all([
          ...provinceList.Items.map((province) =>
            tx
              .insert(provinces)
              .values({
                id: province.IdProvincia,
                name: province.Provincia,
                code: province.CodigoProvincia
              })
              .onConflictDoUpdate({
                target: provinces.id,
                set: conflictUpdateSetAllColumns(provinces)
              })
          ),
          ...cantonList.Items.map((canton) =>
            tx
              .insert(cantons)
              .values({
                id: canton.IdCanton,
                name: canton.Canton,
                code: canton.CodigoCanton,
                provinceId: canton.IdProvincia
              })
              .onConflictDoUpdate({
                target: cantons.id,
                set: conflictUpdateSetAllColumns(cantons)
              })
          ),
          ...districtsList.Items.map((district) =>
            tx
              .insert(districts)
              .values({
                id: district.Id_Distrito,
                name: district.Distrito,
                code: district.Codigo_Distrito,
                cantonId: district.Id_Canton
              })
              .onConflictDoUpdate({
                target: districts.id,
                set: conflictUpdateSetAllColumns(districts)
              })
          )
        ]);
      }),
      (error) =>
        ({
          type: "database_error",
          resource: "syncDistricts",
          error
        }) as const
    ).map(
      () =>
        `Synced ${provinceList.Items.length} provinces, ${cantonList.Items.length} cantons, and ${districtsList.Items.length} districts.`
    );
  });
}
