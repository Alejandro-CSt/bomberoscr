import { publicProcedure, router } from "@/server/trpc/init";
import { getTopStationsByTimesDispatched } from "@bomberoscr/db/queries/charts/topStations";
import { topStationsInputSchema } from "@bomberoscr/lib/time-range";

export const topStationsRouter = router({
  getTopStations: publicProcedure
    .input(topStationsInputSchema.optional())
    .query(async ({ input }) => {
      return await getTopStationsByTimesDispatched(input);
    })
});
