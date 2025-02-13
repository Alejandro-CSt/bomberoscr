import { incidentsRouter } from "@/server/trpc/incidents";
import { router } from "@/server/trpc/init";
import { stationsRouter } from "@/server/trpc/stations";
import type { inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  stations: stationsRouter,
  incidents: incidentsRouter
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
