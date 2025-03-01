import db from "@/server/db";
import {
  type incidentTypesInsertSchema,
  incidentTypes as incidentTypesTable
} from "@/server/db/schema";
import { conflictUpdateSetAllColumns } from "@/server/db/utils";
import { getIncidentTypes } from "@/server/sigae/api";
import type { ItemObtenerTiposIncidente } from "@/server/sigae/types";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import type { z } from "zod";

type IncidentType = z.infer<typeof incidentTypesInsertSchema>;

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

export const syncIncidentTypes = schedules.task({
  id: "sync-incident-types",
  cron: "0 12 * * *",
  queue: {
    concurrencyLimit: 1
  },
  run: async () => {
    logger.info("Starting incident types sync");
    const incidentTypes = await getIncidentTypes();
    logger.info(`Fetched incident types with ${incidentTypes.items.length} top-level items`);
    const incidentTypesList: IncidentType[] = getIncidentsRecursively(incidentTypes.items);
    const count = await db.$count(incidentTypesTable);
    await db
      .insert(incidentTypesTable)
      .values(incidentTypesList)
      .onConflictDoUpdate({
        target: incidentTypesTable.id,
        set: conflictUpdateSetAllColumns(incidentTypesTable)
      });
    logger.info(
      `Incident types upserted. Previous count: ${count}, New total: ${incidentTypesList.length}`
    );
    return count;
  }
});
