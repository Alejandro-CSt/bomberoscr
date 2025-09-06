import { SearchIncidentsInputSchema } from "@/features/map/search/schemas";
import { publicProcedure, router } from "@/features/trpc/init";
import { getTopLevelIncidentTypes } from "@bomberoscr/db/queries/search/incidentTypes";
import { searchIncidentsCoordinates } from "@bomberoscr/db/queries/search/incidents";
import { getOperativeStations } from "@bomberoscr/db/queries/search/operativeStations";
import type { inferRouterOutputs } from "@trpc/server";

export const searchRouter = router({
  getOperativeStations: publicProcedure.query(async () => {
    return getOperativeStations();
  }),
  getIncidentTypesTopTwoLevels: publicProcedure.query(async () => {
    return getTopLevelIncidentTypes();
  }),
  searchIncidents: publicProcedure.input(SearchIncidentsInputSchema).query(async ({ input }) => {
    const stationIds = input.stationIds.map((s) => Number(s)).filter((n) => !Number.isNaN(n));
    const rows = await searchIncidentsCoordinates({
      incidentTypeCodes: input.incidentTypeCodes,
      stationIds,
      start: input.timeRange.start,
      end: input.timeRange.end,
      limit: 500,
      bounds: input.bounds ?? undefined
    });
    return rows;
  })
});

export type SearchIncidentsResult = inferRouterOutputs<typeof searchRouter>["searchIncidents"];
