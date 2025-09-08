import { featuredIncidentsRouter } from "@/features/dashboard/homepage/api/featuredIncidentsRouter";
import { latestIncidentsRouter } from "@/features/dashboard/homepage/api/latestIncidentsRouter";
import { incidentsRouter } from "@/features/map/incidents/api/incidents";
import { searchRouter } from "@/features/map/search/api/searchRouter";
import { stationsRouter } from "@/features/map/stations/api/stations";
import { router } from "@/features/trpc/init";

export const appRouter = router({
  stations: stationsRouter,
  incidents: incidentsRouter,
  featuredIncidents: featuredIncidentsRouter,
  latestIncidents: latestIncidentsRouter,
  search: searchRouter
});

export type AppRouter = typeof appRouter;
