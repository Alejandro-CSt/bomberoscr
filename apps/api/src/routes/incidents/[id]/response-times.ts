import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import {
  calculateTimeDiffInSeconds,
  isUndefinedDate,
  toIsoStringOrNull
} from "@/routes/incidents/_lib/formatters";
import {
  IncidentIdParamSchema,
  IncidentResponseTimesResponseSchema
} from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}/response-times",
  request: {
    params: IncidentIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      IncidentResponseTimesResponseSchema,
      "Response time breakdown for dispatched vehicles"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Incident not found"),
      "Incident not found"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { id } = c.req.valid("param");

  const incident = await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    columns: {
      id: true,
      isOpen: true
    },
    with: {
      dispatchedVehicles: {
        columns: {
          id: true,
          dispatchedTime: true,
          arrivalTime: true,
          departureTime: true,
          baseReturnTime: true
        },
        with: {
          vehicle: {
            columns: {
              internalNumber: true
            }
          },
          station: {
            columns: {
              name: true
            }
          }
        }
      }
    }
  });

  if (!incident) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const vehicles = incident.dispatchedVehicles.map((vehicle) => {
    const responseTimeSeconds = calculateTimeDiffInSeconds(
      vehicle.arrivalTime,
      vehicle.dispatchedTime
    );
    const hasDeparture = !!vehicle.departureTime && !isUndefinedDate(vehicle.departureTime);
    const hasReturn = !!vehicle.baseReturnTime && !isUndefinedDate(vehicle.baseReturnTime);
    const onSceneEndDate = hasDeparture
      ? vehicle.departureTime
      : incident.isOpen
        ? new Date()
        : null;
    const onSceneTimeSeconds = calculateTimeDiffInSeconds(onSceneEndDate, vehicle.arrivalTime);
    const isEnRoute = hasDeparture && !hasReturn;
    const returnTimeSeconds =
      hasDeparture && hasReturn
        ? calculateTimeDiffInSeconds(vehicle.baseReturnTime, vehicle.departureTime)
        : 0;
    const totalTimeSeconds = responseTimeSeconds + onSceneTimeSeconds + returnTimeSeconds;

    return {
      id: vehicle.id,
      vehicle: vehicle.vehicle?.internalNumber || "N/A",
      station: vehicle.station.name,
      dispatchedTime: toIsoStringOrNull(vehicle.dispatchedTime),
      arrivalTime: toIsoStringOrNull(vehicle.arrivalTime),
      departureTime: toIsoStringOrNull(vehicle.departureTime),
      baseReturnTime: toIsoStringOrNull(vehicle.baseReturnTime),
      responseTimeSeconds,
      onSceneTimeSeconds,
      returnTimeSeconds,
      totalTimeSeconds,
      isEnRoute
    };
  });

  return c.json({ incidentId: incident.id, isOpen: incident.isOpen, vehicles }, HttpStatusCodes.OK);
};
