import { publicProcedure, router } from "@/features/trpc/init";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import {
  type FeaturedIncident,
  getFeaturedIncidents
} from "@bomberoscr/db/queries/homepage/featuredIncidents";
import {
  type LatestIncident,
  getLatestIncidents
} from "@bomberoscr/db/queries/homepage/latestIncidents";
import { type YearRecap, getYearRecap } from "@bomberoscr/db/queries/homepage/yearRecap";
import { timeRangeInputSchema, timeRangeSchema } from "@bomberoscr/lib/time-range";
import { z } from "zod";

export const homepageRouter = router({
  getFeaturedIncidents: publicProcedure
    .input(
      z.object({
        timeRange: timeRangeSchema.default(7),
        limit: z.number().min(1).max(30).default(5)
      })
    )
    .query(async ({ input }) => {
      return await getFeaturedIncidents(input);
    }),

  getLatestIncidents: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(30).default(5)
      })
    )
    .query(async ({ input }) => {
      return await getLatestIncidents(input);
    }),

  getTopStations: publicProcedure
    .input(timeRangeInputSchema.optional())
    .query(async ({ input }) => {
      return await getTopDispatchedStations(input);
    }),

  getYearRecap: publicProcedure
    .input(
      z.object({
        year: z
          .number()
          .min(2000)
          .max(new Date().getFullYear() + 1)
      })
    )
    .query(async ({ input }) => {
      return await getYearRecap(input.year);
    })
});

export type { FeaturedIncident, LatestIncident, YearRecap };
