import { publicProcedure, router } from "@/server/trpc/init";
import { getIncidentsForTable } from "@bomberoscr/db/queries/incidentsTable";

export const incidentRouter = router({
  get: publicProcedure.query(async () => {
    return await getIncidentsForTable({ limit: 50 });
  })
});
