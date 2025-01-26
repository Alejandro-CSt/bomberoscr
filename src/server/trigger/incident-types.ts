import db from "@/server/db";
import { conflictUpdateSetAllColumns } from "@/server/db/utils";
import { schedules } from "@trigger.dev/sdk/v3";
import type { z } from "zod";
import { type incidentTypesInsertSchema, incidentTypes as incidentTypesTable } from "../db/schema";
import { getIncidentTypes } from "../sigae/api";
import type { ItemObtenerTiposIncidente } from "../sigae/types";

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
    const incidentTypes = await getIncidentTypes();
    const incidentTypesList: IncidentType[] = getIncidentsRecursively(incidentTypes.items);

    db.insert(incidentTypesTable)
      .values(incidentTypesList)
      .onConflictDoUpdate({
        target: incidentTypesTable.id,
        set: conflictUpdateSetAllColumns(incidentTypesTable)
      });

    return incidentTypesList.length;
  }
});
