import { publicProcedure, router } from "@/features/trpc/init";
import { getStations } from "@bomberoscr/db/queries/map/stations";
import {
  getStationIncidentsByHour,
  getStationIncidentsByTopLevelType,
  getStationStats
} from "@bomberoscr/db/queries/map/stationsCharts";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const stationsRouter = router({
  getStations: publicProcedure
    .input(
      z.object({
        filter: z.enum(["all", "operative"]).optional().default("operative")
      })
    )
    .query(async ({ input }) => {
      return await getStations(input.filter === "all");
    }),
  getStationStats: publicProcedure
    .input(
      z.object({
        key: z.string().nullable()
      })
    )
    .query(async ({ input }) => {
      if (!input.key) return null;
      return await getStationStats(input.key);
    }),
  getStationHourlyStats: publicProcedure
    .input(
      z.object({
        key: z.string().nullable()
      })
    )
    .query(async ({ input }) => {
      if (!input.key) return null;
      return await getStationIncidentsByHour(input.key);
    }),
  getStationIncidentTypes: publicProcedure
    .input(
      z.object({
        key: z.string().nullable()
      })
    )
    .query(async ({ input }) => {
      if (!input.key) return null;
      return await getStationIncidentsByTopLevelType(input.key);
    })
});

export type Station = inferRouterOutputs<typeof stationsRouter>["getStations"][number];
export type StationStats = inferRouterOutputs<typeof stationsRouter>["getStationStats"];
