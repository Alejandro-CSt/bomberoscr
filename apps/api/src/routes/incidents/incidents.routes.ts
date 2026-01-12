import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import {
  HighlightedIncidentsQuerySchema,
  HighlightedIncidentsResponseSchema,
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

export const getMapImage = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}/map",
  request: {
    params: IncidentIdParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Map image for the incident",
      content: {
        "image/avif": {
          schema: {
            type: "string",
            format: "binary"
          }
        },
        "image/webp": {
          schema: {
            type: "string",
            format: "binary"
          }
        },
        "image/jpeg": {
          schema: {
            type: "string",
            format: "binary"
          }
        },
        "image/png": {
          schema: {
            type: "string",
            format: "binary"
          }
        }
      }
    },
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid coordinates"),
      "Invalid coordinates"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Incident not found"),
      "Incident not found"
    ),
    [HttpStatusCodes.BAD_GATEWAY]: jsonContent(
      createMessageObjectSchema("Failed to fetch map image"),
      "Failed to fetch map image"
    )
  }
});

export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;
export type GetOgImageRoute = typeof getOgImage;
export type GetMapImageRoute = typeof getMapImage;

const MapOriginalTokenSchema = z.object({
  token: z.string()
});

export const getMapOriginal = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}/map/original",
  request: {
    params: IncidentIdParamSchema,
    query: MapOriginalTokenSchema
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Original map image from Mapbox (PNG)",
      content: {
        "image/png": {
          schema: {
            type: "string",
            format: "binary"
          }
        }
      }
    },
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "Invalid or missing token"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid coordinates"),
      "Invalid coordinates"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Incident not found"),
      "Incident not found"
    ),
    [HttpStatusCodes.BAD_GATEWAY]: jsonContent(
      createMessageObjectSchema("Failed to fetch map image"),
      "Failed to fetch map image"
    )
  }
});

export type GetMapOriginalRoute = typeof getMapOriginal;

export const getHighlighted = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/highlighted",
  request: {
    query: HighlightedIncidentsQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      HighlightedIncidentsResponseSchema,
      "List of highlighted incidents sorted by total emergency response deployment"
    )
  }
});

export type GetHighlightedRoute = typeof getHighlighted;
