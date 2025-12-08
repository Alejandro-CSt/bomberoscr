import { buildIncidentUrl } from "@/features/shared/lib/utils";
import { publicProcedure, router } from "@/features/trpc/init";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import {
  type HighlightedIncident,
  getHighlightedIncidents
} from "@bomberoscr/db/queries/homepage/highlightedIncidents";
import {
  type LatestIncident,
  getLatestIncidents
} from "@bomberoscr/db/queries/homepage/latestIncidents";
import { type YearRecap, getYearRecap } from "@bomberoscr/db/queries/homepage/yearRecap";
import { timeRangeInputSchema, timeRangeSchema } from "@bomberoscr/lib/time-range";
import type { Route } from "next";
import { z } from "zod";

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

export const homepageRouter = router({
  getHighlightedIncidents: publicProcedure
    .input(
      z.object({
        timeRange: timeRangeSchema.default(30),
        limit: z.number().min(1).max(30).default(5)
      })
    )
    .query(async ({ input }) => {
      const incidents = await getHighlightedIncidents(input);
      return incidents.map((incident) => {
        const details = incident.details || "Incidente";
        return {
          id: incident.id,
          url: buildIncidentUrl(
            incident.id,
            details,
            new Date(incident.incidentTimestamp)
          ) as Route,
          details,
          address: incident.address ?? "Ubicación pendiente",
          dispatchedStationsCount: incident.dispatchedStationsCount,
          dispatchedVehiclesCount: incident.dispatchedVehiclesCount,
          responsibleStation: incident.responsibleStation ?? "Estación pendiente",
          incidentTimestamp: incident.incidentTimestamp.toISOString(),
          latitude: incident.latitude,
          longitude: incident.longitude
        };
      });
    }),

  getLatestIncidents: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(30).default(5)
      })
    )
    .query(async ({ input }) => {
      return await getLatestIncidents(input);
    }),

  getTopStations: publicProcedure
    .input(timeRangeInputSchema.optional())
    .query(async ({ input }) => {
      return await getTopDispatchedStations(input);
    }),

  getYearRecap: publicProcedure
    .input(
      z.object({
        year: z
          .number()
          .min(2000)
          .max(new Date().getFullYear() + 1)
      })
    )
    .query(async ({ input }) => {
      return await getYearRecap(input.year);
    })
});

export type { HighlightedIncident, LatestIncident, YearRecap };
