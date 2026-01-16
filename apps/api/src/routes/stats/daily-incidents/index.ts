import { getDailyIncidents } from "@bomberoscr/db/queries/charts/dailyIncidents";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { DailyIncidentsQuerySchema, DailyIncidentsResponseSchema } from "@/routes/stats/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stats"],
  method: "get",
  path: "/stats/daily-incidents",
  request: {
    query: DailyIncidentsQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      DailyIncidentsResponseSchema,
      "Daily incidents comparison between current and previous period"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { timeRange } = c.req.valid("query");

  const incidents = await getDailyIncidents({ timeRange });

  return c.json(incidents, HttpStatusCodes.OK);
};
