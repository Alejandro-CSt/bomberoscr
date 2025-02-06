import {
  getIncidentById,
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
    .query(async ({ input }) => {
      return await getStations(input.filter === "all");
    }),
  getStationDetails: publicProcedure
    .input(
      z.object({
        id: z.number().nullable()
      })
    )
    .query(async ({ input }) => {
      if (!input.id) return null;
      return await getStationDetails(input.id);
    }),
  getStationDetailsWithIncidents: publicProcedure
    .input(
      z.object({
        id: z.number().nullish()
      })
    )
    .query(async ({ input }) => {
      if (!input.id) return null;
      return await getStationDetailsWithIncidents(input.id);
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
    .query(async ({ input }) => {
      return await getIncidentsCoordinates(input.timeRange);
    }),
  getIncidentById: publicProcedure
    .input(z.object({ id: z.number().nullish() }))
    .query(async ({ input }) => {
      if (!input.id) return null;
      return await getIncidentById(input.id);
    })
});

export type AppRouter = typeof appRouter;

export type OperativeStation = inferRouterOutputs<typeof appRouter>["getStations"][number];
export type StationDetails = inferRouterOutputs<typeof appRouter>["getStationDetails"];
export type StationDetailsWithIncidents = inferRouterOutputs<
  typeof appRouter
>["getStationDetailsWithIncidents"];
export type Incident = inferRouterOutputs<typeof appRouter>["getIncidentsCoordinates"][number];
export type IncidentDetails = inferRouterOutputs<typeof appRouter>["getIncidentById"];
