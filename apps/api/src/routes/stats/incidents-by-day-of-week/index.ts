import { getIncidentsByDayOfWeek } from "@bomberoscr/db/queries/charts/incidentsByDayOfWeek";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import {
  IncidentsByDayOfWeekQuerySchema,
  IncidentsByDayOfWeekResponseSchema
} from "@/routes/stats/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stats"],
  method: "get",
  path: "/stats/incidents-by-day-of-week",
  request: {
    query: IncidentsByDayOfWeekQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      IncidentsByDayOfWeekResponseSchema,
      "Incidents distribution by day of week"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { timeRange } = c.req.valid("query");

  const incidents = await getIncidentsByDayOfWeek({ timeRange });

  return c.json(incidents, HttpStatusCodes.OK);
};
