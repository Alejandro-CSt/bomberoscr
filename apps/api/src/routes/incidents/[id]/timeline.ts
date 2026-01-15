import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { buildTimelineEvents } from "@/routes/incidents/_lib/timeline";
import { IncidentIdParamSchema, IncidentTimelineResponseSchema } from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}/timeline",
  request: {
    params: IncidentIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      IncidentTimelineResponseSchema,
      "Timeline events for the incident"
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
      incidentTimestamp: true,
      isOpen: true,
      modifiedAt: true
    },
    with: {
      dispatchedVehicles: {
        columns: {
          dispatchedTime: true,
          arrivalTime: true,
          departureTime: true
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

  const events = buildTimelineEvents(incident, incident.dispatchedVehicles).map((event) => ({
    id: event.id,
    date: event.date.toISOString(),
    title: event.title,
    ...(event.description ? { description: event.description } : {})
  }));

  return c.json({ incidentId: incident.id, events }, HttpStatusCodes.OK);
};
