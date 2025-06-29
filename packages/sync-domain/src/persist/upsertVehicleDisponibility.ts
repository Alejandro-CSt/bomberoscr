import { db } from "@bomberoscr/db/db";
import {
  type vehicleDisponibilityInsertSchema,
  vehicleDisponibility as vehicleDisponibilityTable
} from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import type { z } from "zod";

type VehicleDisponibility = z.infer<typeof vehicleDisponibilityInsertSchema>;

export async function upsertVehicleDisponibility(states: VehicleDisponibility[]) {
  if (states.length === 0) return;

  await db
    .insert(vehicleDisponibilityTable)
    .values(states)
    .onConflictDoUpdate({
      target: vehicleDisponibilityTable.id,
      set: conflictUpdateSetAllColumns(vehicleDisponibilityTable)
    });
}
