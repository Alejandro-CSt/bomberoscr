import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { buildImgproxyUrl, buildOriginalSourceUrl } from "@/routes/incidents/_lib/map-utils";
import { IncidentIdParamSchema } from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
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

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { id } = c.req.valid("param");

  const sourceUrl = buildOriginalSourceUrl(id);
  const imgproxyUrl = buildImgproxyUrl(sourceUrl);
  const acceptHeader = c.req.header("accept");

  const imgproxyResponse = await fetch(imgproxyUrl, {
    headers: acceptHeader ? { Accept: acceptHeader } : undefined
  });

  if (!imgproxyResponse.ok) {
    const status = imgproxyResponse.status;
    if (status === 404) {
      return c.json({ message: "Incident not found" }, HttpStatusCodes.NOT_FOUND);
    }
    if (status === 400) {
      return c.json({ message: "Invalid coordinates" }, HttpStatusCodes.BAD_REQUEST);
    }
    return c.json({ message: "Failed to fetch map image" }, HttpStatusCodes.BAD_GATEWAY);
  }

  const body = await imgproxyResponse.arrayBuffer();
  const contentType = imgproxyResponse.headers.get("content-type") ?? "image/png";
  const cacheControl =
    imgproxyResponse.headers.get("cache-control") ?? "public, max-age=31536000, immutable";

  return c.body(new Uint8Array(body), HttpStatusCodes.OK, {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    Vary: "Accept"
  });
};
