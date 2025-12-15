import { router } from "@/features/trpc/init";
import type { HighlightedIncident } from "@bomberoscr/db/queries/homepage/highlightedIncidents";
import type { LatestIncident } from "@bomberoscr/db/queries/homepage/latestIncidents";
import type { Route } from "next";

export type MinimalIncident = {
  id: number;
  url: Route;
  details: string;
  address: string;
  dispatchedStationsCount: number;
  dispatchedVehiclesCount: number;
  responsibleStation: string;
  incidentTimestamp: string;
  latitude: string;
  longitude: string;
};

// Empty router kept for potential future procedures
export const homepageRouter = router({});

export type { HighlightedIncident, LatestIncident };
