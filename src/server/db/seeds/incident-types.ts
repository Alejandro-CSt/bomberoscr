import type { DrizzleD1Database } from "drizzle-orm/d1";
import { incidentTypes } from "../schema";
import incidentTypesJson from "./data/ObtenerTiposIncidente.json";

type IncidentType = typeof incidentTypes.$inferInsert;

// biome-ignore lint: any[] is used to represent the JSON structure
function getIncidentsRecursively(items: any[], parentId?: number): IncidentType[] {
  const result: IncidentType[] = [];

  for (const item of items) {
    result.push({
      id: item.id_tipo_incidente,
      incidentCode: item.codigo_tipo_incidente,
      name: item.tipo_incidente,
      parentId: parentId
    });

    if (item.items && item.items.length > 0) {
      result.push(...getIncidentsRecursively(item.items, item.id_tipo_incidente));
    }
  }

  return result;
}

export default async function seed(db: DrizzleD1Database) {
  const incidents: IncidentType[] = getIncidentsRecursively(incidentTypesJson);
  await db.insert(incidentTypes).values(incidents);
}
