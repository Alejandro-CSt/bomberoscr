import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import {
  StationDetailResponseSchema,
  StationKeyParamSchema,
  StationsQuerySchema,
  StationsResponseSchema
} from "@/routes/stations/stations.schemas";

export const list = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations",
  request: {
    query: StationsQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(StationsResponseSchema, "Paginated list of stations")
  }
});

export const getOne = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations/{key}",
  request: {
    params: StationKeyParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(StationDetailResponseSchema, "Station details"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Station not found"),
      "Station not found"
    )
  }
});

export const getImage = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations/{key}/image",
  request: {
    params: StationKeyParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Station image",
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
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Station image not found"),
      "Station image not found"
    ),
    [HttpStatusCodes.BAD_GATEWAY]: jsonContent(
      createMessageObjectSchema("Failed to fetch station image"),
      "Failed to fetch station image"
    )
  }
});

const StationImageTokenSchema = z.object({
  token: z.string()
});

export const getImageOriginal = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations/{key}/image/original",
  request: {
    params: StationKeyParamSchema,
    query: StationImageTokenSchema
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Original station image",
      content: {
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
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "Invalid or missing token"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Station image not found"),
      "Station image not found"
    )
  }
});

export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;
export type GetImageRoute = typeof getImage;
export type GetImageOriginalRoute = typeof getImageOriginal;
