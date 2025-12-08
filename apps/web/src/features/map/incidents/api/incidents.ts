import { publicProcedure, router } from "@/features/trpc/init";
import { getIncidentsCoordinates } from "@bomberoscr/db/queries/incidents";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const incidentsRouter = router({
  getIncidentsCoordinates: publicProcedure
    .input(
      z.object({
        timeRange: z.enum(["24h", "48h", "disabled"]).default("24h")
      })
    )
    .query(async ({ input }) => {
      return await getIncidentsCoordinates(input.timeRange);
    })
});

export type IncidentWithCoordinates = inferRouterOutputs<
  typeof incidentsRouter
>["getIncidentsCoordinates"][number];
