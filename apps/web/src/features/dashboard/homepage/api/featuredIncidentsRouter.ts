import { publicProcedure, router } from "@/features/trpc/init";
import db, { between, desc, eq, sql } from "@bomberoscr/db/index";
import { districts, incidents } from "@bomberoscr/db/schema";
import { DEFAULT_TIME_RANGE, timeRangeSchema } from "@bomberoscr/lib/time-range";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const featuredIncidentsRouter = router({
  /**
   * Get featured incidents for the homepage, sorted by total emergency response deployment
   *
   * Returns incidents from the specified time range, each with a calculated `totalDispatched`
   * field representing the sum of dispatched vehicles and stations. Results are ordered by
   * highest deployment first.
   *
   * @param input.timeRange - Number of days to look back for incidents (7, 30, 90, or 365 days, default: 7)
   * @returns Array of incidents with all fields plus `totalDispatched` count, sorted by deployment size descending
   */
  getFeaturedIncidents: publicProcedure
    .input(
      z.object({
        timeRange: timeRangeSchema.default(DEFAULT_TIME_RANGE),
        limit: z.number().min(1).max(30).default(5)
      })
    )
    .query(async ({ input }) => {
      const { limit, timeRange } = input;
      return await db
        .select({
          id: incidents.id,
          incidentTimestamp: incidents.incidentTimestamp,
          importantDetails: incidents.importantDetails,
          districtName: districts.name,
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
            new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000),
            new Date()
          )
        )
        .leftJoin(districts, eq(incidents.districtId, districts.id))
        .orderBy(
          desc(
            sql`((SELECT COALESCE(COUNT(*), 0) FROM "dispatched_vehicles" dv WHERE dv."incidentId" = incidents.id) + (SELECT COALESCE(COUNT(*), 0) FROM "dispatched_stations" ds WHERE ds."incidentId" = incidents.id))`
          )
        )
        .limit(limit);
    })
});

export type FeaturedIncident = inferRouterOutputs<
  typeof featuredIncidentsRouter
>["getFeaturedIncidents"][number];
