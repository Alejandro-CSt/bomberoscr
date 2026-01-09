import type { AppRouteHandler } from "@/lib/types.js";
import {
  getDetailedIncidentById,
  getIncidentStatistics,
  getIncidentsCoordinates,
  getLatestIncidents
} from "@bomberoscr/db/queries/incidents";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { generateOgImage } from "./incidents.og.js";
import type { GeometryRoute, GetOgImageRoute, GetOneRoute, ListRoute } from "./incidents.routes.js";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { limit, cursor, station } = c.req.valid("query");
  const incidents = await getLatestIncidents({
    limit,
    cursor: cursor ?? null,
    stationFilter: station ?? null
  });

  const hasMore = incidents.length > limit;
  const data = hasMore ? incidents.slice(0, limit) : incidents;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return c.json(
    {
      incidents: data.map((incident) => ({
        ...incident,
        incidentTimestamp: incident.incidentTimestamp.toISOString()
      })),
      nextCursor
    },
    HttpStatusCodes.OK
  );
};

export const geometry: AppRouteHandler<GeometryRoute> = async (c) => {
  const { timeRange } = c.req.valid("query");
  const coordinates = await getIncidentsCoordinates(timeRange);

  return c.json(
    coordinates.map((coord) => ({
      ...coord,
      incidentTimestamp: coord.incidentTimestamp.toISOString()
    })),
    HttpStatusCodes.OK
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const incident = await getDetailedIncidentById(id);

  if (!incident) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const statistics = await getIncidentStatistics(incident);

  return c.json({ incident, statistics }, HttpStatusCodes.OK);
};

export const getOgImage: AppRouteHandler<GetOgImageRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const incident = await getDetailedIncidentById(id);

  if (!incident) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const statistics = await getIncidentStatistics(incident);
  return generateOgImage(incident, statistics);
};
