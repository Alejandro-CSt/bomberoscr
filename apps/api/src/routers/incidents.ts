import {
  getIncidentById,
  getIncidentCoordinatesById,
  getIncidentOgImageData,
  getIncidentResponseTimesData,
  getIncidentTimelineData,
  getIncidents
} from "@bomberoscr/db/queries/incidents";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import env from "@/env";
import { getFromS3, uploadToS3 } from "@/lib/s3";
import {
  IncidentIdParamSchema,
  IncidentResponseTimesResponseSchema,
  IncidentTimelineResponseSchema,
  MapOriginalTokenSchema
} from "@/lib/utils/incidents/_schemas";
import {
  calculateTimeDiffInSeconds,
  isUndefinedDate,
  toIsoStringOrNull
} from "@/lib/utils/incidents/formatters";
import {
  buildImgproxyUrl,
  buildMapboxUrl,
  buildOriginalSourceUrl,
  getS3Key
} from "@/lib/utils/incidents/map-utils";
import { generateOgImage } from "@/lib/utils/incidents/og-image";
import { getIncidentStatistics } from "@/lib/utils/incidents/statistics";
import { buildTimelineEvents } from "@/lib/utils/incidents/timeline";
import {
  IncidentByIdRequest,
  IncidentsListRequest,
  IncidentByIdResponse,
  IncidentsListResponse
} from "@/schemas/incident";

const app = new OpenAPIHono();

function buildDispatchedStations(incident: {
  responsibleStation: number | null;
  dispatchedStations: Array<{
    serviceTypeId: number | null;
    station: { id: number; name: string; stationKey: string };
  }>;
  dispatchedVehicles: Array<{
    id: number;
    stationId: number | null;
    dispatchedTime: Date;
    arrivalTime: Date | null;
    departureTime: Date | null;
    baseReturnTime: Date | null;
    vehicle: { internalNumber: string; plate: string; descriptionType: string } | null;
    station: { id: number; name: string } | null;
  }>;
}) {
  const responsibleStationId =
    incident.dispatchedStations.find((station) => station.serviceTypeId === 1)?.station.id ??
    incident.responsibleStation ??
    null;
  const stationMap = new Map<
    number,
    {
      id: number;
      name: string;
      stationKey: string;
      isResponsible: boolean;
      vehicles: Array<{
        id: number;
        internalNumber: string;
        plate: string;
        type: string;
        dispatchedTime: string;
        arrivalTime: string | null;
        departureTime: string | null;
        baseReturnTime: string | null;
      }>;
    }
  >();

  for (const dispatched of incident.dispatchedStations) {
    const stationId = dispatched.station.id;
    const isResponsible = dispatched.serviceTypeId === 1;
    const existing = stationMap.get(stationId);
    if (existing) {
      if (isResponsible) {
        existing.isResponsible = true;
      }
      continue;
    }
    stationMap.set(stationId, {
      id: stationId,
      name: dispatched.station.name,
      stationKey: dispatched.station.stationKey,
      isResponsible,
      vehicles: []
    });
  }

  for (const vehicle of incident.dispatchedVehicles) {
    const stationId = vehicle.stationId ?? vehicle.station?.id;
    if (!stationId) continue;
    const existing = stationMap.get(stationId);
    if (!existing) {
      stationMap.set(stationId, {
        id: stationId,
        name: vehicle.station?.name ?? "Estación desconocida",
        stationKey: "",
        isResponsible: false,
        vehicles: []
      });
    }

    const vehicleInfo = vehicle.vehicle;
    stationMap.get(stationId)?.vehicles.push({
      id: vehicle.id,
      internalNumber: vehicleInfo?.internalNumber ?? "N/A",
      plate: vehicleInfo?.plate ?? "N/A",
      type: vehicleInfo?.descriptionType ?? "N/A",
      dispatchedTime: vehicle.dispatchedTime.toISOString(),
      arrivalTime: toIsoStringOrNull(vehicle.arrivalTime),
      departureTime: toIsoStringOrNull(vehicle.departureTime),
      baseReturnTime: toIsoStringOrNull(vehicle.baseReturnTime)
    });
  }

  if (
    !Array.from(stationMap.values()).some((station) => station.isResponsible) &&
    responsibleStationId
  ) {
    const fallback = stationMap.get(responsibleStationId);
    if (fallback) {
      fallback.isResponsible = true;
    }
  }

  return Array.from(stationMap.values()).map((station) => ({
    name: station.name,
    stationKey: station.stationKey,
    isResponsible: station.isResponsible,
    vehicles: station.vehicles
  }));
}

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all incidents",
    operationId: "listIncidents",
    description: "Retrieve a list of incidents",
    tags: ["Incidents"],
    request: {
      query: IncidentsListRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(IncidentsListResponse, "List of incidents")
    }
  }),
  async (c) => {
    const { pageSize, cursor, sort, start, end, ...filter } = c.req.valid("query");

    const { data, meta } = await getIncidents({
      pageSize: pageSize ?? 25,
      cursor: cursor ?? null,
      sort: sort ?? [],
      start: start ? new Date(start) : null,
      end: end ? new Date(end) : null,
      ...filter
    });

    return c.json({
      meta,
      data: data.map((incident) => ({
        id: incident.id,
        isOpen: incident.isOpen,
        EEConsecutive: incident.EEConsecutive,
        address: incident.address,
        incidentTimestamp: incident.incidentTimestamp,
        importantDetails: incident.importantDetails,
        dispatchType:
          incident.dispatchIncidentCode && incident.dispatchIncidentType
            ? { code: incident.dispatchIncidentCode, name: incident.dispatchIncidentType }
            : null,
        specificDispatchType:
          incident.specificDispatchIncidentCode && incident.specificDispatchIncidentType
            ? {
                code: incident.specificDispatchIncidentCode,
                name: incident.specificDispatchIncidentType
              }
            : null,
        actualType:
          incident.incidentTypeCode && incident.incidentType
            ? { code: incident.incidentTypeCode, name: incident.incidentType }
            : null,
        specificActualType:
          incident.specificIncidentTypeCode && incident.specificIncidentType
            ? { code: incident.specificIncidentTypeCode, name: incident.specificIncidentType }
            : null,
        dispatchedStationsCount: incident.dispatchedStationsCount ?? 0,
        dispatchedVehiclesCount: incident.dispatchedVehiclesCount ?? 0
      }))
    });
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Retrieve an incident",
    operationId: "getIncidentById",
    description: "Retrieve an incident by its unique identifier",
    tags: ["Incidents"],
    request: { params: IncidentByIdRequest.pick({ id: true }) },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        IncidentByIdResponse,
        "Retrieve an incident by its unique identifier"
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Incident not found"),
        "Incident not found"
      )
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const incident = await getIncidentById({ id });

    if (!incident) {
      return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }

    const dispatchedStations = buildDispatchedStations(incident);
    return c.json(
      {
        id: incident.id,
        isOpen: incident.isOpen,
        EEConsecutive: incident.EEConsecutive,
        address: incident.address,
        incidentTimestamp: incident.incidentTimestamp,
        importantDetails: incident.importantDetails,
        dispatchType:
          incident.dispatchIncidentCode && incident.dispatchIncidentType?.name
            ? { code: incident.dispatchIncidentCode, name: incident.dispatchIncidentType.name }
            : null,
        specificDispatchType:
          incident.specificDispatchIncidentCode && incident.specificDispatchIncidentType?.name
            ? {
                code: incident.specificDispatchIncidentCode,
                name: incident.specificDispatchIncidentType.name
              }
            : null,
        actualType:
          incident.incidentCode && incident.incidentType?.name
            ? { code: incident.incidentCode, name: incident.incidentType.name }
            : null,
        specificActualType:
          incident.specificIncidentCode && incident.specificIncidentType?.name
            ? { code: incident.specificIncidentCode, name: incident.specificIncidentType.name }
            : null,
        dispatchedStations
      },
      HttpStatusCodes.OK
    );
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/timeline",
    summary: "Retrieve incident timeline",
    operationId: "getIncidentTimeline",
    description: "Retrieve timeline events for an incident",
    tags: ["Incidents"],
    request: {
      params: IncidentIdParamSchema
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        IncidentTimelineResponseSchema,
        "Timeline events for the incident"
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Incident not found"),
        "Incident not found"
      )
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const incident = await getIncidentTimelineData({ id });

    if (!incident) {
      return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }

    const events = buildTimelineEvents(incident, incident.dispatchedVehicles).map((event) => ({
      id: event.id,
      date: event.date.toISOString(),
      title: event.title,
      ...(event.description ? { description: event.description } : {})
    }));

    return c.json({ incidentId: incident.id, events }, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/response-times",
    summary: "Retrieve incident response times",
    operationId: "getIncidentResponseTimes",
    description: "Retrieve response time breakdown for dispatched vehicles",
    tags: ["Incidents"],
    request: {
      params: IncidentIdParamSchema
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        IncidentResponseTimesResponseSchema,
        "Response time breakdown for dispatched vehicles"
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Incident not found"),
        "Incident not found"
      )
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const incident = await getIncidentResponseTimesData({ id });

    if (!incident) {
      return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }

    const vehicles = incident.dispatchedVehicles.map((vehicle) => {
      const responseTimeSeconds = calculateTimeDiffInSeconds(
        vehicle.arrivalTime,
        vehicle.dispatchedTime
      );
      const hasDeparture = !!vehicle.departureTime && !isUndefinedDate(vehicle.departureTime);
      const hasReturn = !!vehicle.baseReturnTime && !isUndefinedDate(vehicle.baseReturnTime);
      const onSceneEndDate = hasDeparture
        ? vehicle.departureTime
        : incident.isOpen
          ? new Date()
          : null;
      const onSceneTimeSeconds = calculateTimeDiffInSeconds(onSceneEndDate, vehicle.arrivalTime);
      const isEnRoute = hasDeparture && !hasReturn;
      const returnTimeSeconds =
        hasDeparture && hasReturn
          ? calculateTimeDiffInSeconds(vehicle.baseReturnTime, vehicle.departureTime)
          : 0;
      const totalTimeSeconds = responseTimeSeconds + onSceneTimeSeconds + returnTimeSeconds;

      return {
        id: vehicle.id,
        vehicle: vehicle.vehicle?.internalNumber || "N/A",
        station: vehicle.station.name,
        dispatchedTime: toIsoStringOrNull(vehicle.dispatchedTime),
        arrivalTime: toIsoStringOrNull(vehicle.arrivalTime),
        departureTime: toIsoStringOrNull(vehicle.departureTime),
        baseReturnTime: toIsoStringOrNull(vehicle.baseReturnTime),
        responseTimeSeconds,
        onSceneTimeSeconds,
        returnTimeSeconds,
        totalTimeSeconds,
        isEnRoute
      };
    });

    return c.json(
      { incidentId: incident.id, isOpen: incident.isOpen, vehicles },
      HttpStatusCodes.OK
    );
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/og",
    summary: "Retrieve incident Open Graph image",
    operationId: "getIncidentOgImage",
    description: "Generate the Open Graph image for an incident",
    tags: ["Incidents"],
    request: {
      params: IncidentIdParamSchema
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: "OG Image for the incident",
        content: {
          "image/png": {
            schema: {
              type: "string",
              format: "binary"
            }
          }
        }
      },
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        createMessageObjectSchema("Incident not found"),
        "Incident not found"
      )
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const incident = await getIncidentOgImageData({ id });

    if (!incident) {
      return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }

    const statistics = await getIncidentStatistics(incident);
    return generateOgImage(incident, statistics);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/map",
    summary: "Retrieve incident map image",
    operationId: "getIncidentMap",
    description: "Retrieve the generated map image for an incident",
    tags: ["Incidents"],
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
  }),
  async (c) => {
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
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}/map/original",
    summary: "Retrieve original incident map image",
    operationId: "getIncidentOriginalMap",
    description: "Retrieve the original map image for an incident from Mapbox",
    tags: ["Incidents"],
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
  }),
  async (c) => {
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

    const incident = await getIncidentCoordinatesById({ id });

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
  }
);

export const incidentsRouter = app;
