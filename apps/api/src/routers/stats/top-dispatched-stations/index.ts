import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import {
  TopDispatchedStationsQuerySchema,
  TopDispatchedStationsResponseSchema
} from "@/routers/stats/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stats"],
  method: "get",
  path: "/stats/top-dispatched-stations",
  request: {
    query: TopDispatchedStationsQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      TopDispatchedStationsResponseSchema,
      "Top dispatched stations by count"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { timeRange } = c.req.valid("query");

  const stations = await getTopDispatchedStations({ timeRange });

  return c.json(stations, HttpStatusCodes.OK);
};
