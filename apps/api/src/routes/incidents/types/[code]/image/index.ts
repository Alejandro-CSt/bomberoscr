import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import {
  buildImgproxyUrl,
  buildOriginalSourceUrl,
  findAvailableImageCode
} from "@/routes/incidents/_lib/type-image-utils";
import { IncidentTypeCodeParamSchema } from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/types/{code}/image",
  request: {
    params: IncidentTypeCodeParamSchema
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Incident type illustration image",
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
      createMessageObjectSchema("Image not found"),
      "No image found for this incident type or its parents"
    ),
    [HttpStatusCodes.BAD_GATEWAY]: jsonContent(
      createMessageObjectSchema("Failed to fetch image"),
      "Failed to fetch image from image proxy"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { code } = c.req.valid("param");

  // Find available image (exact match or parent fallback)
  const availableCode = await findAvailableImageCode(code);

  if (!availableCode) {
    return c.json({ message: "Image not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const sourceUrl = buildOriginalSourceUrl(availableCode);
  const imgproxyUrl = buildImgproxyUrl(sourceUrl);
  const acceptHeader = c.req.header("accept");

  const imgproxyResponse = await fetch(imgproxyUrl, {
    headers: acceptHeader ? { Accept: acceptHeader } : undefined
  });

  if (!imgproxyResponse.ok) {
    const status = imgproxyResponse.status;
    if (status === 404) {
      return c.json({ message: "Image not found" }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json({ message: "Failed to fetch image" }, HttpStatusCodes.BAD_GATEWAY);
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
