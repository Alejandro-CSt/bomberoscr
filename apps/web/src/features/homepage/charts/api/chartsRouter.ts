import { publicProcedure, router } from "@/server/trpc/init";
import { getDailyIncidents } from "@bomberoscr/db/queries/charts/dailyIncidents";
import { getIncidentsByDayOfWeek } from "@bomberoscr/db/queries/charts/incidentsByDayOfWeek";
import { getIncidentsByHour } from "@bomberoscr/db/queries/charts/incidentsByHour";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { getTopResponseTimesStations } from "@bomberoscr/db/queries/charts/topResponseTimesStations";
import { type TimeRangeInput, timeRangeInputSchema } from "@bomberoscr/lib/time-range";

export const chartsRouter = router({
  getDailyIncidents: publicProcedure
    .input(timeRangeInputSchema)
    .query(async ({ input }: { input: TimeRangeInput }) => {
      const result = await getDailyIncidents(input);
      return result;
    }),

  getIncidentsByDayOfWeek: publicProcedure
    .input(timeRangeInputSchema)
    .query(async ({ input }: { input: TimeRangeInput }) => {
      const result = await getIncidentsByDayOfWeek(input);
      return result;
    }),

  getIncidentsByHour: publicProcedure
    .input(timeRangeInputSchema)
    .query(async ({ input }: { input: TimeRangeInput }) => {
      const result = await getIncidentsByHour(input);
      return result;
    }),

  getTopDispatchedStations: publicProcedure
    .input(timeRangeInputSchema)
    .query(async ({ input }: { input: TimeRangeInput }) => {
      const result = await getTopDispatchedStations(input);
      return result;
    }),

  getTopResponseTimesStations: publicProcedure
    .input(timeRangeInputSchema)
    .query(async ({ input }: { input: TimeRangeInput }) => {
      const result = await getTopResponseTimesStations(input);
      return result;
    })
});
