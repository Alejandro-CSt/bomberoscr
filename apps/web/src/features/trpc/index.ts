import { featuredIncidentsRouter } from "@/features/dashboard/homepage/api/featuredIncidentsRouter";
import { latestIncidentsRouter } from "@/features/dashboard/homepage/api/latestIncidentsRouter";
import { incidentsRouter } from "@/features/trpc/incidents";
import { router } from "@/features/trpc/init";
import { stationsRouter } from "@/features/trpc/stations";
import type { inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  stations: stationsRouter,
  incidents: incidentsRouter,
  featuredIncidents: featuredIncidentsRouter,
  latestIncidents: latestIncidentsRouter
});

export type AppRouter = typeof appRouter;

export type Station = inferRouterOutputs<typeof appRouter>["stations"]["getStations"][number];
export type StationDetails = inferRouterOutputs<typeof appRouter>["stations"]["getStationDetails"];

export type Incident = inferRouterOutputs<typeof appRouter>["incidents"]["getIncidentById"];
export type LatestIncident = inferRouterOutputs<
  typeof appRouter
>["incidents"]["infiniteIncidents"]["items"][number];
export type IncidentDetails = inferRouterOutputs<
  typeof appRouter
>["incidents"]["getIncidentDetailsById"];
export type IncidentWithCoordinates = inferRouterOutputs<
  typeof appRouter
>["incidents"]["getIncidentsCoordinates"][number];
