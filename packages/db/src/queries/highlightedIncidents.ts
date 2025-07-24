import { between, db, desc, eq, sql } from "@bomberoscr/db/index";
import { districts, incidentTypes, incidents } from "@bomberoscr/db/schema";

export async function getHighlightedIncidents() {
  const highlightedIncidents = await db
    .select({
      id: incidents.id,
      incidentTimestamp: incidents.incidentTimestamp,
      importantDetails: incidents.importantDetails,
      isOpen: incidents.isOpen,
      incidentType: incidentTypes.name,
      address: incidents.address,
      dispatchedVehiclesCount: sql<number>`
            (SELECT COALESCE(COUNT(*), 0)
             FROM "dispatched_vehicles" dv
             WHERE dv."incidentId" = incidents.id
            )
          `.as("dispatchedVehiclesCount"),
      dispatchedStationsCount: sql<number>`
            (SELECT COALESCE(COUNT(*), 0)
             FROM "dispatched_stations" ds
             WHERE ds."incidentId" = incidents.id
            )
          `.as("dispatchedStationsCount")
    })
    .from(incidents)
    .where(
      between(
        incidents.incidentTimestamp,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      )
    )
    .leftJoin(districts, eq(incidents.districtId, districts.id))
    .leftJoin(incidentTypes, eq(incidents.incidentCode, incidentTypes.incidentCode))
    .orderBy(
      desc(
        sql`((SELECT COALESCE(COUNT(*), 0) FROM "dispatched_vehicles" dv WHERE dv."incidentId" = incidents.id) + (SELECT COALESCE(COUNT(*), 0) FROM "dispatched_stations" ds WHERE ds."incidentId" = incidents.id))`
      )
    )
    .limit(6);

  return highlightedIncidents;
}

export type HighlightedIncident = Awaited<ReturnType<typeof getHighlightedIncidents>>[number];
