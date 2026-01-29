import {
  getStationByName,
  getStationCollaborations,
  getStationHighlightedIncidents,
  getStationIdByName,
  getStationIncidentsPerDay,
  getStationVehiclesWithStats,
  getStationsList
} from "@bomberoscr/db/queries/stations";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { createHmac } from "node:crypto";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import env from "@/env";
import { getFromS3 } from "@/lib/s3";
import {
  stationByNameRequest,
  stationByNameResponse,
  stationCollaborationsResponseSchema,
  stationHeatmapQuerySchema,
  stationHeatmapResponseSchema,
  stationHighlightedIncidentsQuerySchema,
  stationHighlightedIncidentsResponseSchema,
  stationImageTokenSchema,
  stationsListRequest,
  stationsListResponse,
  stationVehiclesResponseSchema
} from "@/schemas/stations";

const app = new OpenAPIHono();

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"] as const;

type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

const CONTENT_TYPE_MAP: Record<ImageExtension, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png"
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function encodeImgproxySource(url: string): string {
  return Buffer.from(url)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signImgproxyPath(path: string): string {
  const key = Buffer.from(env.IMGPROXY_KEY, "hex");
  const salt = Buffer.from(env.IMGPROXY_SALT, "hex");
  const signature = createHmac("sha256", key).update(salt).update(path).digest("base64");
  return signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildImgproxyUrl(sourceUrl: string): string {
  const encodedSource = encodeImgproxySource(sourceUrl);
  const path = `/rs:fit:800:600/${encodedSource}`;
  const signature = signImgproxyPath(path);
  return `${normalizeBaseUrl(env.IMGPROXY_BASE_URL)}/${signature}${path}`;
}

function buildOriginalSourceUrl(stationName: string): string {
  const baseUrl = normalizeBaseUrl(env.SITE_URL);
  const encodedName = encodeURIComponent(stationName.trim());
  return `${baseUrl}/bomberos/hono/stations/${encodedName}/image/original?token=${env.IMGPROXY_TOKEN}`;
}

function buildStationImageUrl(stationName: string): string {
  const baseUrl = normalizeBaseUrl(env.API_URL);
  const encodedName = encodeURIComponent(stationName.trim());
  return `${baseUrl}/stations/${encodedName}/image`;
}

async function getStationImage(
  stationKey: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  for (const ext of IMAGE_EXTENSIONS) {
    const s3Key = `stations/${stationKey}.${ext}`;
    const image = await getFromS3(s3Key);
    if (image) {
      return { buffer: image, contentType: CONTENT_TYPE_MAP[ext] };
    }
  }
  return null;
}

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List stations",
    operationId: "listStations",
    description: "Retrieve stations",
    tags: ["Stations"],
    request: {
      query: stationsListRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(stationsListResponse, "List of stations")
    }
  }),
  async (c) => {
    const { limit, page, q, operative, bounds, sort } = c.req.valid("query");

    const { data, meta } = await getStationsList({
      limit,
      page,
      sort: sort ?? [],
      q,
      operative,
      bounds
    });

    return c.json(
      {
        data: data.map((station) => ({
          ...station,
          imageUrl: buildStationImageUrl(station.name)
        })),
        meta
      },
      HttpStatusCodes.OK
    );
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{name}",
    summary: "Retrieve station",
    operationId: "getStationByName",
    description: "Retrieve a station by its name",
    tags: ["Stations"],
    request: {
      params: stationByNameRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(stationByNameResponse, "Station details"),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Station not found"),
        "Station not found"
      )
    }
  }),
  async (c) => {
    const { name } = c.req.valid("param");
    const decodedName = decodeURIComponent(name).trim();
    const station = await getStationByName({ name: decodedName });

    if (!station) {
      return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(
      {
        station: {
          ...station,
          imageUrl: buildStationImageUrl(station.name)
        }
      },
      HttpStatusCodes.OK
    );
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{name}/heatmap",
    summary: "Retrieve station heatmap",
    operationId: "getStationHeatmap",
    description: "Retrieve incident counts per day for the station",
    tags: ["Stations"],
    request: {
      params: stationByNameRequest,
      query: stationHeatmapQuerySchema
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(stationHeatmapResponseSchema, "Incident heatmap data"),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Station not found"),
        "Station not found"
      )
    }
  }),
  async (c) => {
    const { name } = c.req.valid("param");
    const { days } = c.req.valid("query");

    const station = await getStationIdByName({ name: decodeURIComponent(name).trim() });
    if (!station) {
      return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
    }

    const data = await getStationIncidentsPerDay({ stationId: station.id, days });
    const totalIncidents = data.reduce((sum, day) => sum + day.count, 0);

    return c.json({ data, totalIncidents }, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{name}/highlighted-incidents",
    summary: "Retrieve station highlighted incidents",
    operationId: "getStationHighlightedIncidents",
    description: "Retrieve highlighted incidents for the station",
    tags: ["Stations"],
    request: {
      params: stationByNameRequest,
      query: stationHighlightedIncidentsQuerySchema
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        stationHighlightedIncidentsResponseSchema,
        "Highlighted incidents for the station"
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Station not found"),
        "Station not found"
      )
    }
  }),
  async (c) => {
    const { name } = c.req.valid("param");
    const { timeRange, limit } = c.req.valid("query");

    const station = await getStationIdByName({ name: decodeURIComponent(name).trim() });
    if (!station) {
      return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
    }

    const incidents = await getStationHighlightedIncidents({
      stationId: station.id,
      timeRange,
      limit
    });

    return c.json({ incidents }, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{name}/collaborations",
    summary: "Retrieve station collaborations",
    operationId: "getStationCollaborations",
    description: "Retrieve stations that collaborated with the given station",
    tags: ["Stations"],
    request: {
      params: stationByNameRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        stationCollaborationsResponseSchema,
        "Stations that collaborated with this one"
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Station not found"),
        "Station not found"
      )
    }
  }),
  async (c) => {
    const { name } = c.req.valid("param");

    const station = await getStationIdByName({ name: decodeURIComponent(name).trim() });
    if (!station) {
      return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
    }

    const collaborations = await getStationCollaborations({ stationId: station.id });
    return c.json({ collaborations }, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{name}/vehicles",
    summary: "Retrieve station vehicles",
    operationId: "getStationVehicles",
    description: "Retrieve vehicles assigned to the station with stats",
    tags: ["Stations"],
    request: {
      params: stationByNameRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        stationVehiclesResponseSchema,
        "Vehicles assigned to this station with stats"
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Station not found"),
        "Station not found"
      )
    }
  }),
  async (c) => {
    const { name } = c.req.valid("param");

    const station = await getStationIdByName({ name: decodeURIComponent(name).trim() });
    if (!station) {
      return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
    }

    const vehicles = await getStationVehiclesWithStats({ stationId: station.id });
    return c.json({ vehicles }, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{name}/image",
    summary: "Retrieve station image",
    operationId: "getStationImage",
    description: "Retrieve the station image",
    tags: ["Stations"],
    request: {
      params: stationByNameRequest
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
  }),
  async (c) => {
    const { name } = c.req.valid("param");
    const decodedName = decodeURIComponent(name).trim();

    const sourceUrl = buildOriginalSourceUrl(decodedName);
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
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{name}/image/original",
    summary: "Retrieve original station image",
    operationId: "getStationOriginalImage",
    description: "Retrieve the original station image from storage",
    tags: ["Stations"],
    request: {
      params: stationByNameRequest,
      query: stationImageTokenSchema
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
  }),
  async (c) => {
    const { name } = c.req.valid("param");
    const { token } = c.req.valid("query");

    if (token !== env.IMGPROXY_TOKEN) {
      return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
    }

    const station = await getStationIdByName({ name: decodeURIComponent(name).trim() });
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
  }
);

export const stationsRouter = app;
