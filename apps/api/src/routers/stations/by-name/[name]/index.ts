import { db } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { StationDetailResponseSchema, StationNameParamSchema } from "@/routers/stations/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations/by-name/{name}",
  request: {
    params: StationNameParamSchema
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
  const { name } = c.req.valid("param");

  const decodedName = decodeURIComponent(name).trim();

  const station = await db.query.stations.findFirst({
    where: eq(sql`UPPER(${stations.name})`, decodedName.toUpperCase())
  });

  if (!station) {
    return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ station }, HttpStatusCodes.OK);
};
