import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import {
  IncidentIdParamsSchema,
  SearchIncidentsByDateRangeQuerySchema,
  SearchIncidentsByDateRangeResponseSchema,
  SyncIncidentsBodySchema,
  SyncIncidentsResponseSchema,
  SyncSingleIncidentResponseSchema
} from "@/routes/admin/admin.schemas";

const unauthorizedResponse = {
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
    createMessageObjectSchema("Unauthorized"),
    "Missing or invalid admin-token cookie"
  )
};

const serviceUnavailableResponse = {
  [HttpStatusCodes.SERVICE_UNAVAILABLE]: jsonContent(
    createMessageObjectSchema("Admin synchronization is disabled"),
    "Admin synchronization is disabled"
  )
};

export const listIncidents = createRoute({
  tags: ["Admin"],
  method: "get",
  path: "/admin/incidents",
  request: {
    query: SearchIncidentsByDateRangeQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      SearchIncidentsByDateRangeResponseSchema,
      "List of incidents from SIGAE within the date range"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      createMessageObjectSchema("Failed to fetch incident list from SIGAE"),
      "Failed to fetch incident list from SIGAE"
    ),
    ...unauthorizedResponse,
    ...serviceUnavailableResponse
  }
});

export const syncIncidents = createRoute({
  tags: ["Admin"],
  method: "post",
  path: "/admin/incidents",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SyncIncidentsBodySchema
        }
      }
    }
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      SyncIncidentsResponseSchema,
      "Sync results for the provided incident IDs"
    ),
    ...unauthorizedResponse,
    ...serviceUnavailableResponse
  }
});

export const syncIncident = createRoute({
  tags: ["Admin"],
  method: "post",
  path: "/admin/incidents/{id}",
  request: {
    params: IncidentIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      SyncSingleIncidentResponseSchema,
      "Sync result for the incident"
    ),
    ...unauthorizedResponse,
    ...serviceUnavailableResponse
  }
});

export type ListIncidentsRoute = typeof listIncidents;
export type SyncIncidentsRoute = typeof syncIncidents;
export type SyncIncidentRoute = typeof syncIncident;
