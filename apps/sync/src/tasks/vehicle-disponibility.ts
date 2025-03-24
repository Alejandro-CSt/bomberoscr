import db from "@repo/db/db";
import {
  type vehicleDisponibilityInsertSchema,
  vehicleDisponibility as vehicleDisponibilityTable
} from "@repo/db/schema";
import { conflictUpdateSetAllColumns } from "@repo/db/utils";
import { getVehicleDisponibilityStates } from "@repo/sigae/api";
import * as Sentry from "@sentry/node";
import type { z } from "zod";

type VehicleDisponibilityType = z.infer<typeof vehicleDisponibilityInsertSchema>;

export async function syncVehicleDisponibility() {
  Sentry.captureMessage("Starting vehicle disponibility sync");
  const vehicleDisponibilityStates = await getVehicleDisponibilityStates();
  Sentry.captureMessage(
    `Fetched ${vehicleDisponibilityStates.Items.length} vehicle disponibility states`
  );
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
  Sentry.captureMessage("Vehicle disponibility updated in database");
  return vehicleDisponibility.length;
}
