import type { AppRouteHandler } from "@/lib/types";
import env from "@/env";
import { getFromS3, uploadToS3 } from "@/lib/s3";
import { buildIncidentSlug, buildIncidentSlugFromPartial } from "@/lib/slug";
import { db } from "@bomberoscr/db/index";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations
} from "@bomberoscr/db/schema";
import {
  aliasedTable,
  and,
  asc,
  between,
  desc,
  eq,
  gt,
  inArray,
  lt,
  ne,
  or,
  sql
} from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { generateOgImage } from "@/routes/incidents/incidents.og";
import { createHmac } from "node:crypto";
import type {
  GetHighlightedRoute,
  GetMapImageRoute,
  GetMapOriginalRoute,
  GetOgImageRoute,
  GetOneRoute,
  ListRoute
} from "@/routes/incidents/incidents.routes";

const MAPBOX_CONFIG = {
  zoom: 15.73,
  bearing: 0,
  pitch: 39,
  width: 640,
  height: 360
};

function buildMapboxUrl(latitude: number, longitude: number): string {
  const { zoom, bearing, pitch, width, height } = MAPBOX_CONFIG;
  const marker = `pin-s+ff3b30(${longitude},${latitude})`;
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${marker}/${longitude},${latitude},${zoom},${bearing},${pitch}/${width}x${height}@2x?access_token=${env.MAPBOX_API_KEY}`;
}

function getS3Key(incidentId: number): string {
  return `incidents/${incidentId}/map.png`;
}

function buildOriginalSourceUrl(incidentId: number): string {
  const baseUrl = normalizeBaseUrl(env.SITE_URL);
  return `${baseUrl}/bomberos/hono/incidents/${incidentId}/map/original?token=${env.IMGPROXY_TOKEN}`;
}

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
  const width = MAPBOX_CONFIG.width * 2;
  const height = MAPBOX_CONFIG.height * 2;
  const processingOptions = `rs:fit:${width}:${height}`;
  const encodedSource = encodeImgproxySource(sourceUrl);
  const path = `/${processingOptions}/${encodedSource}`;
  const signature = signImgproxyPath(path);
  return `${normalizeBaseUrl(env.IMGPROXY_BASE_URL)}/${signature}${path}`;
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { limit, cursor, station, view, startTime, endTime, sortBy, sortOrder } =
    c.req.valid("query");

  if (view === "map") {
    return handleMapView(c, { station, startTime, endTime, sortBy, sortOrder });
  }

  return handleDefaultView(c, {
    limit,
    cursor,
    station,
    startTime,
    endTime,
    sortBy,
    sortOrder
  });
};

type SortBy = "id" | "incidentTimestamp";
type SortOrder = "asc" | "desc";

type ListQueryParams = {
  limit: number;
  cursor?: number;
  station?: string | null;
  startTime?: Date;
  endTime?: Date;
  sortBy: SortBy;
  sortOrder: SortOrder;
};

async function handleDefaultView(
  c: Parameters<AppRouteHandler<ListRoute>>[0],
  { limit, cursor, station, startTime, endTime, sortBy, sortOrder }: ListQueryParams
) {
  const specificIncidentType = aliasedTable(incidentTypes, "specificIncidentType");

  let stationId: number | undefined = undefined;
  if (station) {
    const stationRecord = await db.query.stations.findFirst({
      where: eq(stations.stationKey, station),
      columns: { id: true }
    });
    stationId = stationRecord?.id;
  }

  const sortColumn = sortBy === "id" ? incidents.id : incidents.incidentTimestamp;
  const cursorOp = sortOrder === "desc" ? lt : gt;
  const orderFn = sortOrder === "desc" ? desc : asc;

  let whereClause = cursor ? cursorOp(incidents.id, cursor) : undefined;

  if (stationId) {
    const dispatchedIncidents = await db
      .select({ incidentId: dispatchedStations.incidentId })
      .from(dispatchedStations)
      .where(eq(dispatchedStations.stationId, stationId));

    const dispatchedIncidentIds = dispatchedIncidents.map((d) => d.incidentId);

    whereClause = and(
      whereClause,
      or(eq(incidents.responsibleStation, stationId), inArray(incidents.id, dispatchedIncidentIds))
    );
  }

  if (startTime && endTime) {
    whereClause = and(whereClause, between(incidents.incidentTimestamp, startTime, endTime));
  }

  const results = await db
    .select({
      id: incidents.id,
      isOpen: incidents.isOpen,
      EEConsecutive: incidents.EEConsecutive,
      address: incidents.address,
      incidentTimestamp: incidents.incidentTimestamp,
      importantDetails: incidents.importantDetails,
      specificIncidentCode: incidents.specificIncidentCode,
      incidentType: incidentTypes.name,
      responsibleStation: stations.name,
      specificIncidentType: specificIncidentType.name,
      dispatchedVehiclesCount: db.$count(
        dispatchedVehicles,
        eq(dispatchedVehicles.incidentId, incidents.id)
      ),
      dispatchedStationsCount: db.$count(
        dispatchedStations,
        eq(dispatchedStations.incidentId, incidents.id)
      )
    })
    .from(incidents)
    .where(whereClause)
    .limit(limit + 1)
    .leftJoin(incidentTypes, eq(incidents.incidentCode, incidentTypes.incidentCode))
    .leftJoin(
      specificIncidentType,
      eq(incidents.specificIncidentCode, specificIncidentType.incidentCode)
    )
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .orderBy(orderFn(sortColumn), orderFn(incidents.id));

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return c.json(
    {
      view: "default" as const,
      incidents: data.map((incident) => ({
        ...incident,
        slug: buildIncidentSlugFromPartial({
          id: incident.id,
          incidentTimestamp: incident.incidentTimestamp,
          importantDetails: incident.importantDetails,
          specificIncidentType: incident.specificIncidentType,
          incidentType: incident.incidentType
        }),
        incidentTimestamp: incident.incidentTimestamp.toISOString()
      })),
      nextCursor
    },
    HttpStatusCodes.OK
  );
}

async function handleMapView(
  c: Parameters<AppRouteHandler<ListRoute>>[0],
  { station, startTime, endTime, sortBy, sortOrder }: Omit<ListQueryParams, "limit" | "cursor">
) {
  if (!startTime || !endTime) {
    return c.json({ view: "map" as const, incidents: [] }, HttpStatusCodes.OK);
  }

  let stationId: number | undefined = undefined;
  if (station) {
    const stationRecord = await db.query.stations.findFirst({
      where: eq(stations.stationKey, station),
      columns: { id: true }
    });
    stationId = stationRecord?.id;
  }

  let whereClause = and(
    ne(incidents.latitude, "0"),
    between(incidents.incidentTimestamp, startTime, endTime)
  );

  if (stationId) {
    const dispatchedIncidents = await db
      .select({ incidentId: dispatchedStations.incidentId })
      .from(dispatchedStations)
      .where(eq(dispatchedStations.stationId, stationId));

    const dispatchedIncidentIds = dispatchedIncidents.map((d) => d.incidentId);

    whereClause = and(
      whereClause,
      or(eq(incidents.responsibleStation, stationId), inArray(incidents.id, dispatchedIncidentIds))
    );
  }

  const sortColumn = sortBy === "id" ? incidents.id : incidents.incidentTimestamp;
  const orderFn = sortOrder === "desc" ? desc : asc;

  const results = await db.query.incidents.findMany({
    columns: {
      id: true,
      incidentTimestamp: true,
      importantDetails: true,
      latitude: true,
      longitude: true
    },
    where: whereClause,
    orderBy: [orderFn(sortColumn), orderFn(incidents.id)]
  });

  return c.json(
    {
      view: "map" as const,
      incidents: results.map((incident) => ({
        id: incident.id,
        slug: buildIncidentSlugFromPartial({
          id: incident.id,
          incidentTimestamp: incident.incidentTimestamp,
          importantDetails: incident.importantDetails
        }),
        latitude: incident.latitude,
        longitude: incident.longitude
      }))
    },
    HttpStatusCodes.OK
  );
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const incident = await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    with: {
      canton: true,
      district: true,
      province: true,
      dispatchedStations: {
        columns: {
          id: true,
          attentionOnFoot: true,
          serviceTypeId: true
        },
        with: {
          station: {
            columns: {
              id: true,
              name: true,
              stationKey: true,
              address: true,
              latitude: true,
              longitude: true
            }
          }
        }
      },
      dispatchedVehicles: {
        columns: {
          incidentId: false,
          stationId: false,
          vehicleId: false
        },
        with: {
          vehicle: {
            columns: {
              id: true,
              internalNumber: true,
              class: true
            }
          },
          station: {
            columns: {
              name: true
            }
          }
        }
      },
      dispatchIncidentType: {
        columns: {
          name: true
        }
      },
      specificDispatchIncidentType: {
        columns: {
          name: true
        }
      },
      incidentType: {
        columns: {
          name: true
        }
      },
      specificIncidentType: {
        columns: {
          name: true
        }
      }
    }
  });

  if (!incident) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const statistics = await getIncidentStatistics(incident);

  return c.json({ incident, statistics }, HttpStatusCodes.OK);
};

export const getOgImage: AppRouteHandler<GetOgImageRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const incident = await db.query.incidents.findFirst({
    where: eq(incidents.id, id),
    with: {
      canton: true,
      district: true,
      province: true,
      dispatchedStations: {
        columns: {
          id: true,
          attentionOnFoot: true,
          serviceTypeId: true
        },
        with: {
          station: {
            columns: {
              id: true,
              name: true,
              stationKey: true,
              address: true,
              latitude: true,
              longitude: true
            }
          }
        }
      },
      dispatchedVehicles: {
        columns: {
          incidentId: false,
          stationId: false,
          vehicleId: false
        },
        with: {
          vehicle: {
            columns: {
              id: true,
              internalNumber: true,
              class: true
            }
          },
          station: {
            columns: {
              name: true
            }
          }
        }
      },
      dispatchIncidentType: {
        columns: {
          name: true
        }
      },
      specificDispatchIncidentType: {
        columns: {
          name: true
        }
      },
      incidentType: {
        columns: {
          name: true
        }
      },
      specificIncidentType: {
        columns: {
          name: true
        }
      }
    }
  });

  if (!incident) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const statistics = await getIncidentStatistics(incident);
  return generateOgImage(incident, statistics);
};

export const getMapImage: AppRouteHandler<GetMapImageRoute> = async (c) => {
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

export const getMapOriginal: AppRouteHandler<GetMapOriginalRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const { token } = c.req.valid("query");

  if (token !== env.IMGPROXY_TOKEN) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const s3Key = getS3Key(id);

  // Check S3 cache first
  const cachedImage = await getFromS3(s3Key);
  if (cachedImage) {
    return c.body(new Uint8Array(cachedImage), HttpStatusCodes.OK, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    });
  }

  // Not cached - verify incident exists
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

  // Fetch from Mapbox
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

  // Save to S3 in background
  void uploadToS3(s3Key, imageBuffer, "image/png").catch((error) => {
    console.error("Failed to save original to S3:", error);
  });

  return c.body(new Uint8Array(imageBuffer), HttpStatusCodes.OK, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable"
  });
};

type DetailedIncident = NonNullable<Awaited<ReturnType<typeof db.query.incidents.findFirst>>>;

async function getIncidentStatistics(incident: DetailedIncident) {
  const year = incident.incidentTimestamp.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const incidentTimestamp = incident.incidentTimestamp;

  const incidentTypeCode = incident.specificIncidentCode || incident.incidentCode;
  const cantonId = incident.cantonId;
  const districtId = incident.districtId;

  const [typeInYear, typeInCanton, districtTotal, typePreviousYear] = await Promise.all([
    incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    cantonId && incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.cantonId, cantonId),
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    districtId
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.districtId, districtId),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(
                incidents.incidentTimestamp,
                new Date(year - 1, 0, 1),
                new Date(year - 1, 11, 31, 23, 59, 59)
              )
            )
          )
      : Promise.resolve([{ count: 0 }])
  ]);

  return {
    typeRankInYear: typeInYear[0]?.count ?? 0,
    typeRankInCanton: typeInCanton[0]?.count ?? 0,
    districtIncidentsThisYear: districtTotal[0]?.count ?? 0,
    typeCountPreviousYear: typePreviousYear[0]?.count ?? 0,
    year
  };
}

export type IncidentStatistics = Awaited<ReturnType<typeof getIncidentStatistics>>;

export const getHighlighted: AppRouteHandler<GetHighlightedRoute> = async (c) => {
  const { timeRange } = c.req.valid("query");
  const limit = 6;

  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  // Pre-aggregate counts in subqueries instead of correlated subqueries per row
  const vehicleCounts = db
    .select({
      incidentId: dispatchedVehicles.incidentId,
      vehicleCount: sql<number>`count(*)::int`.as("vehicle_count")
    })
    .from(dispatchedVehicles)
    .groupBy(dispatchedVehicles.incidentId)
    .as("vehicle_counts");

  const stationCounts = db
    .select({
      incidentId: dispatchedStations.incidentId,
      stationCount: sql<number>`count(*)::int`.as("station_count")
    })
    .from(dispatchedStations)
    .groupBy(dispatchedStations.incidentId)
    .as("station_counts");

  const results = await db
    .select({
      id: incidents.id,
      incidentTimestamp: incidents.incidentTimestamp,
      details: incidents.importantDetails,
      address: incidents.address,
      responsibleStation: stations.name,
      latitude: incidents.latitude,
      longitude: incidents.longitude,
      dispatchedVehiclesCount: sql<number>`COALESCE(${vehicleCounts.vehicleCount}, 0)`,
      dispatchedStationsCount: sql<number>`COALESCE(${stationCounts.stationCount}, 0)`
    })
    .from(incidents)
    .leftJoin(stations, eq(incidents.responsibleStation, stations.id))
    .leftJoin(vehicleCounts, eq(incidents.id, vehicleCounts.incidentId))
    .leftJoin(stationCounts, eq(incidents.id, stationCounts.incidentId))
    .where(between(incidents.incidentTimestamp, startDate, endDate))
    .orderBy(
      desc(
        sql`COALESCE(${vehicleCounts.vehicleCount}, 0) + COALESCE(${stationCounts.stationCount}, 0)`
      )
    )
    .limit(limit);

  return c.json(
    {
      incidents: results.map((incident) => ({
        id: incident.id,
        slug: buildIncidentSlug(incident.id, incident.details, incident.incidentTimestamp),
        incidentTimestamp: incident.incidentTimestamp.toISOString(),
        details: incident.details || "Incidente",
        address: incident.address || "Ubicación pendiente",
        responsibleStation: incident.responsibleStation || "Estación pendiente",
        dispatchedVehiclesCount: incident.dispatchedVehiclesCount,
        dispatchedStationsCount: incident.dispatchedStationsCount,
        hasMapImage:
          incident.latitude !== null &&
          incident.longitude !== null &&
          Number(incident.latitude) !== 0 &&
          Number(incident.longitude) !== 0
      }))
    },
    HttpStatusCodes.OK
  );
};
