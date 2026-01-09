import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

const IncidentSchema = z.object({
  id: z.number(),
  isOpen: z.boolean(),
  EEConsecutive: z.string().nullable(),
  address: z.string().nullable(),
  incidentTimestamp: z.string(),
  importantDetails: z.string().nullable(),
  specificIncidentCode: z.string().nullable(),
  incidentType: z.string().nullable(),
  responsibleStation: z.string().nullable(),
  specificIncidentType: z.string().nullable(),
  dispatchedVehiclesCount: z.number(),
  dispatchedStationsCount: z.number()
});

const IncidentsListSchema = z.object({
  incidents: z.array(IncidentSchema),
  nextCursor: z.number().nullable()
});

const IncidentGeometrySchema = z.object({
  id: z.number(),
  incidentTimestamp: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  importantDetails: z.string().nullable(),
  incidentType: z
    .object({
      name: z.string()
    })
    .nullable()
});

export const list = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents",
  request: {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(20),
      cursor: z.coerce.number().optional(),
      station: z.string().optional()
    })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(IncidentsListSchema, "List of incidents")
  }
});

export const geometry = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/geometry",
  request: {
    query: z.object({
      timeRange: z.enum(["24h", "48h", "disabled"]).default("24h")
    })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(IncidentGeometrySchema),
      "Incident coordinates for map display"
    )
  }
});

export const getOne = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/{id}",
  request: {
    params: z.object({
      id: z.coerce.number().openapi({
        param: {
          name: "id",
          in: "path",
          required: true
        },
        example: 1556825
      })
    })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({}).passthrough(), "Detailed incident information"),
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
    params: z.object({
      id: z.coerce.number().openapi({
        param: {
          name: "id",
          in: "path",
          required: true
        },
        example: 1556825
      })
    })
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
export type GeometryRoute = typeof geometry;
export type GetOneRoute = typeof getOne;
export type GetOgImageRoute = typeof getOgImage;
