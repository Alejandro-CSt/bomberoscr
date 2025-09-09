import { homepageRouter } from "@/features/dashboard/homepage/api/homepageRouter";
import { incidentsRouter } from "@/features/map/incidents/api/incidents";
import { searchRouter } from "@/features/map/search/api/searchRouter";
import { stationsRouter } from "@/features/map/stations/api/stations";
import { router } from "@/features/trpc/init";

export const appRouter = router({
  stations: stationsRouter,
  incidents: incidentsRouter,
  homepage: homepageRouter,
  search: searchRouter
});

export type AppRouter = typeof appRouter;
