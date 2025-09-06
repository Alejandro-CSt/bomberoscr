import { db } from "@bomberoscr/db/index";
import { incidentTypes } from "@bomberoscr/db/schema";
import { and, asc, isNull, ne } from "drizzle-orm";

export type IncidentTypeBasic = {
  code: string;
  name: string;
};

export async function getTopLevelIncidentTypes(): Promise<IncidentTypeBasic[]> {
  const rows = await db
    .select({
      incidentCode: incidentTypes.incidentCode,
      name: incidentTypes.name
    })
    .from(incidentTypes)
    .where(and(ne(incidentTypes.incidentCode, "98"), isNull(incidentTypes.parentId)))
    .orderBy(asc(incidentTypes.incidentCode));

  return rows.map((r) => ({ code: r.incidentCode, name: r.name }));
}
