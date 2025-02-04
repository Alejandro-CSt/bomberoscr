import {
  getOperativeStations,
  getStationDetails,
  getStationDetailsWithIncidents
} from "@/server/db/queries";
import { publicProcedure, router } from "@/server/trpc/init";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
  getOperativeStations: publicProcedure.query(async () => {
    return await getOperativeStations();
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
    })
});

export type AppRouter = typeof appRouter;

export type OperativeStation = inferRouterOutputs<typeof appRouter>["getOperativeStations"][number];
export type StationDetails = inferRouterOutputs<typeof appRouter>["getStationDetails"];
export type StationDetailsWithIncidents = inferRouterOutputs<
  typeof appRouter
>["getStationDetailsWithIncidents"];
