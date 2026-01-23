import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import env from "@/env";
import { getFromS3 } from "@/lib/s3";
import { findAvailableImageCode, getS3Key } from "@/routes/incidents/_lib/type-image-utils";
import {
  IncidentTypeCodeParamSchema,
  TypeImageOriginalTokenSchema
} from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents/types/{code}/image/original",
  request: {
    params: IncidentTypeCodeParamSchema,
    query: TypeImageOriginalTokenSchema
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Original incident type image (PNG)",
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
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Image not found"),
      "No image found for this incident type or its parents"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { code } = c.req.valid("param");
  const { token } = c.req.valid("query");

  if (token !== env.IMGPROXY_TOKEN) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  // Find available image (exact match or parent fallback)
  const availableCode = await findAvailableImageCode(code);

  if (!availableCode) {
    return c.json({ message: "Image not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const s3Key = getS3Key(availableCode);
  const imageBuffer = await getFromS3(s3Key);

  if (!imageBuffer) {
    return c.json({ message: "Image not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(new Uint8Array(imageBuffer), HttpStatusCodes.OK, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable"
  });
};
