import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import {
  IncidentDetailResponseSchema,
  IncidentIdParamSchema,
  IncidentsQuerySchema,
  IncidentsResponseSchema
} from "@/routes/incidents/incidents.schemas";

export const list = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents",
  request: {
    query: IncidentsQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      IncidentsResponseSchema,
      "List of incidents. 'default' view returns paginated results with nextCursor; 'map' view returns all matching coordinates (max 3 day range)."
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid time range"),
      "Invalid time range (must be positive and not exceed 3 days for map view)"
    )
  }
});

export const getOne = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}",
  request: {
    params: IncidentIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      IncidentDetailResponseSchema,
      "Detailed incident information"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Incident not found"),
      "Incident not found"
    )
  }
});

export const getOgImage = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}/og",
  request: {
    params: IncidentIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "OG Image for the incident",
      content: {
        "image/png": {
          schema: {
            type: "string",
            format: "binary"
          }
        }
      }
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Incident not found"),
      "Incident not found"
    )
  }
});

export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;
export type GetOgImageRoute = typeof getOgImage;
