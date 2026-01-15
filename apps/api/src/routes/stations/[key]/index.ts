import { db } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { StationDetailResponseSchema, StationKeyParamSchema } from "@/routes/stations/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations/{key}",
  request: {
    params: StationKeyParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(StationDetailResponseSchema, "Station details"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Station not found"),
      "Station not found"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { key } = c.req.valid("param");

  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, key)
  });

  if (!station) {
    return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ station }, HttpStatusCodes.OK);
};
