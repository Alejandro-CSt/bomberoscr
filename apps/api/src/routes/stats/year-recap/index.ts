import { getYearRecap } from "@bomberoscr/db/queries/homepage/yearRecap";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { YearRecapQuerySchema, YearRecapResponseSchema } from "@/routes/stats/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stats"],
  method: "get",
  path: "/stats/year-recap",
  request: {
    query: YearRecapQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      YearRecapResponseSchema,
      "Year-to-date statistics about emergency response"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { year } = c.req.valid("query");

  const data = await getYearRecap(year);

  return c.json(
    {
      year,
      totalIncidents: data.totalIncidents,
      frequency: data.frequency,
      busiestDate: data.busiestDate,
      busiestStation: data.busiestStation,
      busiestVehicle: data.busiestVehicle
        ? {
            internalNumber: data.busiestVehicle.internalNumber,
            count: data.busiestVehicle.count
          }
        : null,
      mostPopularIncidentType: data.mostPopularIncidentType
        ? {
            name: data.mostPopularIncidentType.name,
            count: data.mostPopularIncidentType.count
          }
        : null
    },
    HttpStatusCodes.OK
  );
};
