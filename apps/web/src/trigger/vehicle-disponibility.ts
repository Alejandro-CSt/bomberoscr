import { getVehicleDisponibilityStates } from "@/server/sigae/api";
import db from "@repo/db/db";
import {
  type vehicleDisponibilityInsertSchema,
  vehicleDisponibility as vehicleDisponibilityTable
} from "@repo/db/schema";
import { conflictUpdateSetAllColumns } from "@repo/db/utils";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import type { z } from "zod";

type VehicleDisponibilityType = z.infer<typeof vehicleDisponibilityInsertSchema>;

export const syncVehicleDisponibility = schedules.task({
  id: "sync-vehicle-disponibility",
  cron: "0 12 * * *",
  queue: {
    concurrencyLimit: 1
  },
  run: async () => {
    logger.info("Starting vehicle disponibility sync");
    const vehicleDisponibilityStates = await getVehicleDisponibilityStates();
    logger.info(`Fetched ${vehicleDisponibilityStates.Items.length} vehicle disponibility states`);
    const vehicleDisponibility: VehicleDisponibilityType[] = vehicleDisponibilityStates.Items.map(
      (state) => ({
        id: state.IdGrupoClasificacion,
        description: state.Descripcion
      })
    );

    await db
      .insert(vehicleDisponibilityTable)
      .values(vehicleDisponibility)
      .onConflictDoUpdate({
        target: vehicleDisponibilityTable.id,
        set: conflictUpdateSetAllColumns(vehicleDisponibilityTable)
      });
    logger.info("Vehicle disponibility updated in database");
    return vehicleDisponibility.length;
  }
});
