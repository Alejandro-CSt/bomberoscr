import { db } from "@bomberoscr/db/index";
import { getStationIncidentsPerDay } from "@bomberoscr/db/queries/stations/incidentsPerDay";
import { stations } from "@bomberoscr/db/schema";
import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { StationHeatmapResponseSchema, StationKeyParamSchema } from "@/routers/stations/_schemas";

import type { AppRouteHandler } from "@/lib/types";

const QuerySchema = z.object({
  days: z.coerce.number().min(1).max(365).default(365).openapi({
    description: "Number of days to include in heatmap data",
    example: 365
  })
});

export const route = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations/{key}/heatmap",
  request: {
    params: StationKeyParamSchema,
    query: QuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      StationHeatmapResponseSchema,
      "Heatmap data showing incidents per day"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Station not found"),
      "Station not found"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { key } = c.req.valid("param");
  const { days } = c.req.valid("query");

  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, key),
    columns: { id: true }
  });

  if (!station) {
    return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const data = await getStationIncidentsPerDay({
    stationId: station.id,
    days
  });

  const totalIncidents = data.reduce((sum, day) => sum + day.count, 0);

  return c.json({ data, totalIncidents }, HttpStatusCodes.OK);
};
