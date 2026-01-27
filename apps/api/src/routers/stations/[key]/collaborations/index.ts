import { db } from "@bomberoscr/db/index";
import { getStationCollaborations } from "@bomberoscr/db/queries/stations/collaborations";
import { stations } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import {
  StationCollaborationsResponseSchema,
  StationKeyParamSchema
} from "@/routers/stations/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations/{key}/collaborations",
  request: {
    params: StationKeyParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      StationCollaborationsResponseSchema,
      "Stations that collaborated with this one"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Station not found"),
      "Station not found"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { key } = c.req.valid("param");

  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, key),
    columns: { id: true }
  });

  if (!station) {
    return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const collaborations = await getStationCollaborations({
    stationId: station.id
  });

  return c.json({ collaborations }, HttpStatusCodes.OK);
};
