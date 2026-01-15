import { db } from "@bomberoscr/db/index";
import { dispatchedStations, dispatchedVehicles, incidents, stations } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { between, desc, eq, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { buildIncidentSlug } from "@/lib/slug";
import {
  HighlightedIncidentsQuerySchema,
  HighlightedIncidentsResponseSchema
} from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/highlighted",
  request: {
    query: HighlightedIncidentsQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      HighlightedIncidentsResponseSchema,
      "List of highlighted incidents sorted by total emergency response deployment"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { timeRange } = c.req.valid("query");
  const limit = 6;

  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  const vehicleCounts = db
    .select({
      incidentId: dispatchedVehicles.incidentId,
      vehicleCount: sql<number>`count(*)::int`.as("vehicle_count")
    })
    .from(dispatchedVehicles)
    .groupBy(dispatchedVehicles.incidentId)
    .as("vehicle_counts");

  const stationCounts = db
    .select({
      incidentId: dispatchedStations.incidentId,
      stationCount: sql<number>`count(*)::int`.as("station_count")
    })
    .from(dispatchedStations)
    .groupBy(dispatchedStations.incidentId)
    .as("station_counts");

  const results = await db
    .select({
      id: incidents.id,
      incidentTimestamp: incidents.incidentTimestamp,
      details: incidents.importantDetails,
      address: incidents.address,
      responsibleStation: stations.name,
      latitude: incidents.latitude,
      longitude: incidents.longitude,
      dispatchedVehiclesCount: sql<number>`COALESCE(${vehicleCounts.vehicleCount}, 0)`,
      dispatchedStationsCount: sql<number>`COALESCE(${stationCounts.stationCount}, 0)`
    })
    .from(incidents)
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .leftJoin(vehicleCounts, eq(incidents.id, vehicleCounts.incidentId))
    .leftJoin(stationCounts, eq(incidents.id, stationCounts.incidentId))
    .where(between(incidents.incidentTimestamp, startDate, endDate))
    .orderBy(
      desc(
        sql`COALESCE(${vehicleCounts.vehicleCount}, 0) + COALESCE(${stationCounts.stationCount}, 0)`
      )
    )
    .limit(limit);

  return c.json(
    {
      incidents: results.map((incident) => ({
        id: incident.id,
        slug: buildIncidentSlug(incident.id, incident.details, incident.incidentTimestamp),
        incidentTimestamp: incident.incidentTimestamp.toISOString(),
        details: incident.details || "Incidente",
        address: incident.address || "Ubicación pendiente",
        responsibleStation: incident.responsibleStation || "Estación pendiente",
        dispatchedVehiclesCount: incident.dispatchedVehiclesCount,
        dispatchedStationsCount: incident.dispatchedStationsCount,
        hasMapImage:
          incident.latitude !== null &&
          incident.longitude !== null &&
          Number(incident.latitude) !== 0 &&
          Number(incident.longitude) !== 0
      }))
    },
    HttpStatusCodes.OK
  );
};
