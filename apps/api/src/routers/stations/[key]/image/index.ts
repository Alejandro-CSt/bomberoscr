import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { buildImgproxyUrl, buildOriginalSourceUrl } from "@/routers/stations/_lib/image-utils";
import { StationKeyParamSchema } from "@/routers/stations/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
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

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { key } = c.req.valid("param");

  const sourceUrl = buildOriginalSourceUrl(key);
  const imgproxyUrl = buildImgproxyUrl(sourceUrl);
  const acceptHeader = c.req.header("accept");

  const imgproxyResponse = await fetch(imgproxyUrl, {
    headers: acceptHeader ? { Accept: acceptHeader } : undefined
  });

  if (!imgproxyResponse.ok) {
    const status = imgproxyResponse.status;
    if (status === 404) {
      return c.json({ message: "Station image not found" }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json({ message: "Failed to fetch station image" }, HttpStatusCodes.BAD_GATEWAY);
  }

  const body = await imgproxyResponse.arrayBuffer();
  const contentType = imgproxyResponse.headers.get("content-type") ?? "image/jpeg";
  const cacheControl =
    imgproxyResponse.headers.get("cache-control") ?? "public, max-age=31536000, immutable";

  return c.body(new Uint8Array(body), HttpStatusCodes.OK, {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    Vary: "Accept"
  });
};
