import {
  getDetailedIncidentById,
  getIncidentById,
  getIncidentsCoordinates,
  getLatestIncidents,
  getLatestIncidentsCoordinates
} from "@/server/queries";
import { publicProcedure, router } from "@/server/trpc/init";
import { z } from "zod";

export const incidentsRouter = router({
  getLatestIncidentsCoordinates: publicProcedure.query(async () => {
    return await getLatestIncidentsCoordinates();
  }),
  infiniteIncidents: publicProcedure
    .input(
      z.object({
        limit: z.number().min(10).max(50).optional(),
        cursor: z.number().nullish(),
        stationFilter: z.string().nullish()
      })
    )
    .query(async (opts) => {
      const { input } = opts;
      const limit = input.limit ?? 15;
      const { cursor, stationFilter } = input;
      const items = await getLatestIncidents({
        cursor: cursor ?? null,
        limit: limit,
        stationFilter: stationFilter ?? null
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }
      return { items, nextCursor };
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
      return (await getIncidentById(input.id)).at(0);
    }),
  getIncidentDetailsById: publicProcedure
    .input(z.object({ id: z.number().nullish() }))
    .query(async ({ input }) => {
      if (!input.id) return null;
      return await getDetailedIncidentById(input.id);
    })
});
