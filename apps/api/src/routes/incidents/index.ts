import { db } from "@bomberoscr/db/index";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations
} from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { aliasedTable, and, asc, between, desc, eq, gt, inArray, lt, ne, or } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { buildIncidentSlugFromPartial } from "@/lib/slug";
import { IncidentsQuerySchema, IncidentsResponseSchema } from "@/routes/incidents/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Incidents"],
  method: "get",
  path: "/incidents",
  request: {
    query: IncidentsQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      IncidentsResponseSchema,
      "List of incidents. 'default' view returns paginated results with nextCursor; 'map' view returns all matching coordinates (max 3 day range)."
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid time range"),
      "Invalid time range (must be positive and not exceed 3 days for map view)"
    )
  }
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
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
  c: Parameters<AppRouteHandler<typeof route>>[0],
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
  c: Parameters<AppRouteHandler<typeof route>>[0],
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
