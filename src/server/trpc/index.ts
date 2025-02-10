import { router } from "@/server/trpc/init";
import type { inferRouterOutputs } from "@trpc/server";
import { incidentsRouter } from "./incidents";
import { stationsRouter } from "./stations";

export const appRouter = router({
  stations: stationsRouter,
  incidents: incidentsRouter
});

export type AppRouter = typeof appRouter;

export type Station = inferRouterOutputs<typeof appRouter>["stations"]["getStations"][number];
export type StationDetails = inferRouterOutputs<typeof appRouter>["stations"]["getStationDetails"];
export type Incident = inferRouterOutputs<
  typeof appRouter
>["incidents"]["getIncidentsCoordinates"][number];
export type IncidentDetails = inferRouterOutputs<typeof appRouter>["incidents"]["getIncidentById"];
