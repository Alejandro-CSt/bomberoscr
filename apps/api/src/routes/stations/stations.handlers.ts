import { db, ilike } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { and, asc, eq, gt, or } from "drizzle-orm";
import { createHmac } from "node:crypto";
import * as HttpStatusCodes from "stoker/http-status-codes";

import env from "@/env";
import { getFromS3 } from "@/lib/s3";

import type { AppRouteHandler } from "@/lib/types";
import type {
  GetImageOriginalRoute,
  GetImageRoute,
  GetOneRoute,
  ListRoute
} from "@/routes/stations/stations.routes";

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

function buildOriginalSourceUrl(stationKey: string): string {
  const baseUrl = normalizeBaseUrl(env.SITE_URL);
  return `${baseUrl}/bomberos/hono/stations/${stationKey}/image/original?token=${env.IMGPROXY_TOKEN}`;
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

function buildWhereClause(conditions: Array<ReturnType<typeof and> | undefined>) {
  const filters = conditions.filter((condition) => condition !== undefined);
  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  return and(...filters);
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { limit, cursor, search, isOperative, view } = c.req.valid("query");

  const searchTerm = search?.trim();
  const searchCondition = searchTerm
    ? or(ilike(stations.name, `%${searchTerm}%`), ilike(stations.stationKey, `%${searchTerm}%`))
    : undefined;

  const baseFilters = [
    typeof isOperative === "boolean" ? eq(stations.isOperative, isOperative) : undefined,
    searchCondition
  ];

  if (view === "map") {
    const whereClause = buildWhereClause(baseFilters);

    const results = await db
      .select({
        id: stations.id,
        stationKey: stations.stationKey,
        latitude: stations.latitude,
        longitude: stations.longitude
      })
      .from(stations)
      .where(whereClause)
      .orderBy(asc(stations.name));

    return c.json(
      {
        view: "map",
        stations: results
      },
      HttpStatusCodes.OK
    );
  }

  const whereClause = buildWhereClause([
    cursor ? gt(stations.id, cursor) : undefined,
    ...baseFilters
  ]);

  const results = await db
    .select({
      id: stations.id,
      name: stations.name,
      stationKey: stations.stationKey,
      address: stations.address,
      latitude: stations.latitude,
      longitude: stations.longitude,
      isOperative: stations.isOperative
    })
    .from(stations)
    .where(whereClause)
    .orderBy(asc(stations.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return c.json(
    {
      view: "default",
      stations: data,
      nextCursor
    },
    HttpStatusCodes.OK
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { key } = c.req.valid("param");

  const station = await db.query.stations.findFirst({
    where: eq(stations.stationKey, key)
  });

  if (!station) {
    return c.json({ message: "Station not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ station }, HttpStatusCodes.OK);
};

export const getImage: AppRouteHandler<GetImageRoute> = async (c) => {
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

export const getImageOriginal: AppRouteHandler<GetImageOriginalRoute> = async (c) => {
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
