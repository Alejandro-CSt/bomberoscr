import { getTopResponseTimesStations } from "@bomberoscr/db/queries/charts/topResponseTimesStations";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import {
  TopResponseTimesQuerySchema,
  TopResponseTimesResponseSchema
} from "@/routers/stats/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stats"],
  method: "get",
  path: "/stats/top-response-times",
  request: {
    query: TopResponseTimesQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      TopResponseTimesResponseSchema,
      "Station response time rankings (fastest, slowest, and national average)"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { timeRange } = c.req.valid("query");

  const stations = await getTopResponseTimesStations({ timeRange });

  return c.json(stations, HttpStatusCodes.OK);
};
