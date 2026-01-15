import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import env from "@/env";
import { getFromS3, uploadToS3 } from "@/lib/s3";
import { buildMapboxUrl, getS3Key } from "@/routes/incidents/_lib/map-utils";
import { IncidentIdParamSchema, MapOriginalTokenSchema } from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
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

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { id } = c.req.valid("param");
  const { token } = c.req.valid("query");

  if (token !== env.IMGPROXY_TOKEN) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const s3Key = getS3Key(id);

  const cachedImage = await getFromS3(s3Key);
  if (cachedImage) {
    return c.body(new Uint8Array(cachedImage), HttpStatusCodes.OK, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    });
  }

  const incident = await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    columns: {
      id: true,
      latitude: true,
      longitude: true
    }
  });

  if (!incident) {
    return c.json({ message: "Incident not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const latitude = Number(incident.latitude);
  const longitude = Number(incident.longitude);

  if (!latitude || !longitude || latitude === 0 || longitude === 0) {
    return c.json({ message: "Invalid coordinates" }, HttpStatusCodes.BAD_REQUEST);
  }

  const mapboxUrl = buildMapboxUrl(latitude, longitude);
  const mapboxResponse = await fetch(mapboxUrl, {
    headers: { Referer: env.SITE_URL }
  });

  if (!mapboxResponse.ok) {
    const responseBody = await mapboxResponse.text().catch(() => "");
    console.error("Mapbox response error:", {
      status: mapboxResponse.status,
      statusText: mapboxResponse.statusText,
      body: responseBody.slice(0, 500)
    });
    return c.json({ message: "Failed to fetch map image" }, HttpStatusCodes.BAD_GATEWAY);
  }

  const imageBuffer = await mapboxResponse.arrayBuffer();

  void uploadToS3(s3Key, imageBuffer, "image/png").catch((error) => {
    console.error("Failed to save original to S3:", error);
  });

  return c.body(new Uint8Array(imageBuffer), HttpStatusCodes.OK, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable"
  });
};
