import {
  getIncidentsCoordinates,
  getLatestIncidentsCoordinates,
  getStationDetails,
  getStationDetailsWithIncidents,
  getStations
} from "@/server/db/queries";
import { publicProcedure, router } from "@/server/trpc/init";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
  getStations: publicProcedure
    .input(
      z.object({
        filter: z.enum(["all", "operative"]).optional().default("operative")
      })
    )
    .query(async (opts) => {
      return await getStations(opts.input.filter === "all");
    }),
  getStationDetails: publicProcedure
    .input(
      z.object({
        id: z.number().nullable()
      })
    )
    .query(async (opts) => {
      if (!opts.input.id) return null;
      return await getStationDetails(opts.input.id);
    }),
  getStationDetailsWithIncidents: publicProcedure
    .input(
      z.object({
        id: z.number().nullish()
      })
    )
    .query(async (opts) => {
      if (!opts.input.id) return null;
      return await getStationDetailsWithIncidents(opts.input.id);
    }),
  getLatestIncidentsCoordinates: publicProcedure.query(async () => {
    return await getLatestIncidentsCoordinates();
  }),
  getIncidentsCoordinates: publicProcedure
    .input(
      z.object({
        timeRange: z.enum(["24h", "48h", "disabled"]).default("24h")
      })
    )
    .query(async (opts) => {
      return await getIncidentsCoordinates(opts.input.timeRange);
    })
});

export type AppRouter = typeof appRouter;

export type OperativeStation = inferRouterOutputs<typeof appRouter>["getStations"][number];
export type StationDetails = inferRouterOutputs<typeof appRouter>["getStationDetails"];
export type StationDetailsWithIncidents = inferRouterOutputs<
  typeof appRouter
>["getStationDetailsWithIncidents"];
