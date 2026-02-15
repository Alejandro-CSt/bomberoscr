import { db } from "@bomberoscr/db/index";
import { incidents, incidentTypes, stations } from "@bomberoscr/db/schema";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const specificIncidentTypes = alias(incidentTypes, "specific_incident_types_sitemap");
const actualIncidentTypes = alias(incidentTypes, "actual_incident_types_sitemap");

export async function getSitemapStations() {
  return await db
    .select({
      name: stations.name
    })
    .from(stations)
    .orderBy(stations.name);
}

export async function getSitemapIncidents() {
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
    .orderBy(desc(incidents.id));
}
