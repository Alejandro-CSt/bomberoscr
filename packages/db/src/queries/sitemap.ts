import { db } from "@bomberoscr/db/index";
import { incidents, incidentTypes, stations } from "@bomberoscr/db/schema";
import { desc, eq, max, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const specificIncidentTypes = alias(incidentTypes, "specific_incident_types_sitemap");
const actualIncidentTypes = alias(incidentTypes, "actual_incident_types_sitemap");
const incidentMonthBucket = sql`date_trunc('month', ${incidents.incidentTimestamp})`;

export async function getSitemapStations() {
  return await db
    .select({
      name: stations.name
    })
    .from(stations)
    .orderBy(stations.name);
}

export async function getSitemapIncidentMonths() {
  return await db
    .select({
      month: sql<string>`to_char(${incidentMonthBucket}, 'YYYY-MM')`,
      lastmod: max(incidents.modifiedAt)
    })
    .from(incidents)
    .groupBy(incidentMonthBucket)
    .orderBy(desc(incidentMonthBucket));
}

export async function getSitemapIncidentsByMonth(yearMonth: string) {
  return await db
    .select({
      id: incidents.id,
      incidentTimestamp: incidents.incidentTimestamp,
      modifiedAt: incidents.modifiedAt,
      importantDetails: incidents.importantDetails,
      specificIncidentType: specificIncidentTypes.name,
      incidentType: actualIncidentTypes.name
    })
    .from(incidents)
    .leftJoin(
      specificIncidentTypes,
      eq(incidents.specificIncidentCode, specificIncidentTypes.incidentCode)
    )
    .leftJoin(actualIncidentTypes, eq(incidents.incidentCode, actualIncidentTypes.incidentCode))
    .where(sql`to_char(${incidentMonthBucket}, 'YYYY-MM') = ${yearMonth}`)
    .orderBy(desc(incidents.id));
}
