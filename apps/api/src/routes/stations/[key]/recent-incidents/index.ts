import { db } from "@bomberoscr/db/index";
import { getStationRecentIncidents } from "@bomberoscr/db/queries/stations/recentIncidents";
import { stations } from "@bomberoscr/db/schema";
import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import {
  StationKeyParamSchema,
  StationRecentIncidentsResponseSchema
} from "@/routes/stations/_schemas";

import type { AppRouteHandler } from "@/lib/types";

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(20).default(5).openapi({
    description: "Maximum number of incidents to return",
    example: 5
  })
});

export const route = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations/{key}/recent-incidents",
  request: {
    params: StationKeyParamSchema,
    query: QuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      StationRecentIncidentsResponseSchema,
      "Most recent incidents for the station"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Station not found"),
      "Station not found"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { key } = c.req.valid("param");
  const { limit } = c.req.valid("query");

  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, key),
    columns: { id: true }
  });

  if (!station) {
    return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const incidents = await getStationRecentIncidents({
    stationId: station.id,
    limit
  });

  return c.json({ incidents }, HttpStatusCodes.OK);
};
