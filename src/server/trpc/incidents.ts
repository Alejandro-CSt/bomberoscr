import {
  getIncidentById,
  getIncidentsCoordinates,
  getLatestIncidentsCoordinates
} from "@/server/db/queries";
import { publicProcedure, router } from "@/server/trpc/init";
import { z } from "zod";

export const incidentsRouter = router({
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
