import db from "@bomberoscr/db/db";
import { cantons, districts, provinces } from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import logger from "@bomberoscr/lib/logger";
import { getCantonsList, getDistrictsList, getProvincesList } from "@bomberoscr/sigae/api";
import * as Sentry from "@sentry/node";

export async function syncDistricts() {
  const span = Sentry.getActiveSpan();
  const provinceList = await getProvincesList();
  const cantonList = await getCantonsList();
  const districtsList = await getDistrictsList();

  logger.info(
    `Syncing ${provinceList.Items.length} provinces, ${cantonList.Items.length} cantons and ${districtsList.Items.length} districts from API`
  );
  span?.setAttribute("provinceList", provinceList.Items.length);
  span?.setAttribute("cantonList", cantonList.Items.length);
  span?.setAttribute("districtsList", districtsList.Items.length);

  for (const province of provinceList.Items) {
    await db
      .insert(provinces)
      .values({
        id: province.IdProvincia,
        name: province.Provincia,
        code: province.CodigoProvincia
      })
      .onConflictDoUpdate({
        target: provinces.id,
        set: conflictUpdateSetAllColumns(provinces)
      });
  }

  for (const canton of cantonList.Items) {
    await db
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
      });
  }

  for (const district of districtsList.Items) {
    await db
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
      });
  }

  logger.info("Districts sync completed");
}
