import db from "@bomberoscr/db/db";
import {
  type vehicleDisponibilityInsertSchema,
  vehicleDisponibility as vehicleDisponibilityTable
} from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import logger from "@bomberoscr/lib/logger";
import { getVehicleDisponibilityStates } from "@bomberoscr/sigae/api";
import * as Sentry from "@sentry/node";

import type { z } from "zod";

type VehicleDisponibilityType = z.infer<typeof vehicleDisponibilityInsertSchema>;

export async function syncVehicleDisponibility() {
  const span = Sentry.getActiveSpan();
  logger.info("Starting vehicle disponibility sync");
  const vehicleDisponibilityStates = await getVehicleDisponibilityStates();
  span?.setAttribute("vehicleDisponibilityStates", vehicleDisponibilityStates.Items.length);
  logger.info(
    `Retrieved ${vehicleDisponibilityStates.Items.length} vehicle disponibility states from API`
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

  logger.info(
    `Vehicle disponibility sync completed - States count: ${vehicleDisponibility.length}`
  );
  return vehicleDisponibility.length;
}
