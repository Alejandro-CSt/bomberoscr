import { publicProcedure, router } from "@/features/trpc/init";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { timeRangeInputSchema } from "@bomberoscr/lib/time-range";

export const topStationsRouter = router({
  getTopStations: publicProcedure
    .input(timeRangeInputSchema.optional())
    .query(async ({ input }) => {
      return await getTopDispatchedStations(input);
    })
});
