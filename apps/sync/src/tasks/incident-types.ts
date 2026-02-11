import db from "@bomberoscr/db/db";
import {
  type incidentTypesInsertSchema,
  incidentTypes as incidentTypesTable
} from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import logger from "@bomberoscr/lib/logger";
import { getIncidentTypes } from "@bomberoscr/sigae/api";
import * as Sentry from "@sentry/node";

import type { ItemObtenerTiposIncidente } from "@bomberoscr/sigae/types";
import type { z } from "zod";

type IncidentType = z.infer<typeof incidentTypesInsertSchema>;

export async function syncIncidentTypes() {
  const span = Sentry.getActiveSpan();
  const incidentTypes = await getIncidentTypes();
  span?.setAttribute("incidentTypes", incidentTypes.items.length);

  const incidentTypesList: IncidentType[] = getIncidentsRecursively(incidentTypes.items);
  const prevCount = await db.$count(incidentTypesTable);
  await db
    .insert(incidentTypesTable)
    .values(incidentTypesList)
    .onConflictDoUpdate({
      target: incidentTypesTable.id,
      set: conflictUpdateSetAllColumns(incidentTypesTable)
    });
  const newCount = await db.$count(incidentTypesTable);
  logger.info(`Incident types synced - Previous: ${prevCount}, New: ${newCount}`);
}

function getIncidentsRecursively(
  items: ItemObtenerTiposIncidente[],
  parentId?: number
): IncidentType[] {
  const result: IncidentType[] = [];

  for (const item of items) {
    result.push({
      id: item.id_tipo_incidente,
      incidentCode: item.codigo_tipo_incidente,
      name: item.tipo_incidente,
      parentId: parentId ?? null
    });

    if (item.items && item.items.length > 0) {
      result.push(...getIncidentsRecursively(item.items, item.id_tipo_incidente));
    }
  }

  return result;
}
