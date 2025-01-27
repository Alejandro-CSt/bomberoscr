import db from "@/server/db";
import {
  type vehicleDisponibilityInsertSchema,
  vehicleDisponibility as vehicleDisponibilityTable
} from "@/server/db/schema";
import { conflictUpdateSetAllColumns } from "@/server/db/utils";
import { schedules } from "@trigger.dev/sdk/v3";
import type { z } from "zod";
import { getVehicleDisponibilityStates } from "../sigae/api";

type VehicleDisponibilityType = z.infer<typeof vehicleDisponibilityInsertSchema>;

export const syncVehicleDisponibility = schedules.task({
  id: "sync-vehicle-disponibility",
  cron: "0 12 * * *",
  queue: {
    concurrencyLimit: 1
  },
  run: async () => {
    const vehicleDisponibilityStates = await getVehicleDisponibilityStates();
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

    return vehicleDisponibility.length;
  }
});
