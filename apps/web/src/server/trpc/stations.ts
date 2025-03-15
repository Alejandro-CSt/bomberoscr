import {
  getStationDetails,
  getStationIncidents,
  getStationIncidentsByHour,
  getStationIncidentsByTopLevelType,
  getStationStats,
  getStations
} from "@/server/db/queries";
import { publicProcedure, router } from "@/server/trpc/init";
import { TRPCError, type inferRouterOutputs } from "@trpc/server";
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
  getStationDetails: publicProcedure
    .input(
      z.object({
        key: z.string().nullable()
      })
    )
    .query(async ({ input }) => {
      if (!input.key) return null;
      return await getStationDetails(input.key);
    }),
  getStationIncidents: publicProcedure
    .input(
      z.object({
        key: z.string().nullable()
      })
    )
    .query(async ({ input }) => {
      if (!input.key) throw new TRPCError({ code: "BAD_REQUEST" });
      const incidents = await getStationIncidents(input.key);
      if (!incidents) throw new TRPCError({ code: "NOT_FOUND" });
      return incidents;
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

export type StationIncidents = inferRouterOutputs<typeof stationsRouter>["getStationIncidents"];
export type StationStats = inferRouterOutputs<typeof stationsRouter>["getStationStats"];
