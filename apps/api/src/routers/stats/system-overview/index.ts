import { getSystemOverview } from "@bomberoscr/db/queries/systemOverview";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { SystemOverviewResponseSchema } from "@/routers/stats/_schemas";

import type { AppRouteHandler } from "@/lib/types";

/**
 * GET /stats/system-overview
 * Returns system-wide statistics including station count, active vehicles, and average response time.
 */
export const route = createRoute({
  tags: ["Stats"],
  method: "get",
  path: "/stats/system-overview",
  description:
    "Get system-wide overview statistics including operative stations, active vehicles, and average response time over the last 30 days",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SystemOverviewResponseSchema, "System overview statistics")
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const data = await getSystemOverview();

  return c.json(
    {
      stationCount: data.stationCount,
      activeVehicleCount: data.activeVehicleCount,
      avgResponseTimeMinutes: data.avgResponseTimeMinutes
    },
    HttpStatusCodes.OK
  );
};
