import { db } from "@bomberoscr/db/index";
import {
  type incidentTypesInsertSchema,
  incidentTypes as incidentTypesTable
} from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import { getIncidentTypes } from "@bomberoscr/sync-domain/api";
import { ResultAsync } from "neverthrow";

import { fetcher } from "@/config/fetcher";

import type { ItemObtenerTiposIncidente } from "@bomberoscr/sync-domain/types";
import type { z } from "zod";

export type IncidentTypesSyncError = {
  type: "api_error" | "database_error";
  resource: string;
  error: unknown;
};

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

export function syncIncidentTypes(): ResultAsync<string, IncidentTypesSyncError> {
  return getIncidentTypes({ fetcher })
    .mapErr(
      (error) =>
        ({
          type: "api_error",
          resource: "incident_types",
          error
        }) as const
    )
    .andThen((incidentTypes) => {
      const incidentTypesList: IncidentType[] = getIncidentsRecursively(incidentTypes.items);

      if (incidentTypesList.length === 0) {
        return ResultAsync.fromPromise(
          Promise.resolve(),
          () => ({ type: "database_error", resource: "syncIncidentTypes", error: null }) as const
        ).map(() => "Synced 0 incident types.");
      }

      return ResultAsync.fromPromise(
        db
          .insert(incidentTypesTable)
          .values(incidentTypesList)
          .onConflictDoUpdate({
            target: incidentTypesTable.id,
            set: conflictUpdateSetAllColumns(incidentTypesTable)
          }),
        (error) =>
          ({
            type: "database_error",
            resource: "syncIncidentTypes",
            error
          }) as const
      ).map(() => `Synced ${incidentTypesList.length} incident types.`);
    });
}
