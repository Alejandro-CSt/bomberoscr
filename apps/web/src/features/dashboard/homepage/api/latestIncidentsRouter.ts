import { publicProcedure, router } from "@/features/trpc/init";
import db, { desc, eq, sql } from "@bomberoscr/db/index";
import { districts, incidentTypes, incidents, stations } from "@bomberoscr/db/schema";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const latestIncidentsRouter = router({
  /**
   * Get the latest incidents for the homepage
   *
   * Returns the most recent incidents ordered by timestamp descending.
   *
   * @param input.limit - Number of incidents to return (default: 5, max: 30)
   * @returns Array of latest incidents with all fields, sorted by timestamp descending
   */
  getLatestIncidents: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(30).default(5)
      })
    )
    .query(async ({ input }) => {
      const { limit } = input;
      return await db
        .select({
          id: incidents.id,
          incidentTimestamp: incidents.incidentTimestamp,
          address: incidents.address,
          importantDetails: incidents.importantDetails,
          districtName: districts.name,
          responsibleStation: stations.name,
          incidentType: incidentTypes.name,
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
        .leftJoin(districts, eq(incidents.districtId, districts.id))
        .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
        .leftJoin(incidentTypes, eq(incidents.specificIncidentCode, incidentTypes.incidentCode))
        .orderBy(desc(incidents.incidentTimestamp))
        .limit(limit);
    })
});

export type LatestIncident = inferRouterOutputs<
  typeof latestIncidentsRouter
>["getLatestIncidents"][number];
