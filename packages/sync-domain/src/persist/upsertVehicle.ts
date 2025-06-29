import { db } from "@bomberoscr/db/db";
import { type vehiclesInsertSchema, vehicles as vehiclesTable } from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import type { z } from "zod";

type Vehicle = z.infer<typeof vehiclesInsertSchema>;

export async function upsertVehicle(vehicles: Vehicle[]) {
  if (vehicles.length === 0) return;

  await db
    .insert(vehiclesTable)
    .values(vehicles)
    .onConflictDoUpdate({
      target: vehiclesTable.id,
      set: conflictUpdateSetAllColumns(vehiclesTable)
    });
}
