import { getIncidentsByHour } from "@bomberoscr/db/queries/charts/incidentsByHour";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import {
  IncidentsByHourQuerySchema,
  IncidentsByHourResponseSchema
} from "@/routers/stats/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stats"],
  method: "get",
  path: "/stats/incidents-by-hour",
  request: {
    query: IncidentsByHourQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      IncidentsByHourResponseSchema,
      "Incidents distribution by hour of day"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { timeRange } = c.req.valid("query");

  const incidents = await getIncidentsByHour({ timeRange });

  return c.json(incidents, HttpStatusCodes.OK);
};
