import { db } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import env from "@/env";
import { getStationImage } from "@/routes/stations/_lib/image-utils";
import { StationImageTokenSchema, StationKeyParamSchema } from "@/routes/stations/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
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

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { key } = c.req.valid("param");
  const { token } = c.req.valid("query");

  if (token !== env.IMGPROXY_TOKEN) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, key),
    columns: {
      stationKey: true
    }
  });

  if (!station) {
    return c.json({ message: "Station image not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const image = await getStationImage(station.stationKey);

  if (!image) {
    return c.json({ message: "Station image not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(new Uint8Array(image.buffer), HttpStatusCodes.OK, {
    "Content-Type": image.contentType,
    "Cache-Control": "public, max-age=31536000, immutable"
  });
};
