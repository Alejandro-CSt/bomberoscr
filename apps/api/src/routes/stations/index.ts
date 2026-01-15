import { db, ilike } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { and, asc, eq, gt, or } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { StationsQuerySchema, StationsResponseSchema } from "@/routes/stations/_schemas";

import type { AppRouteHandler } from "@/lib/types";

export const route = createRoute({
  tags: ["Stations"],
  method: "get",
  path: "/stations",
  request: {
    query: StationsQuerySchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(StationsResponseSchema, "Paginated list of stations")
  }
});

function buildWhereClause(conditions: Array<ReturnType<typeof and> | undefined>) {
  const filters = conditions.filter((condition) => condition !== undefined);
  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  return and(...filters);
}

export const handler: AppRouteHandler<typeof route> = async (c) => {
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
        view: "map" as const,
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
      view: "default" as const,
      stations: data,
      nextCursor
    },
    HttpStatusCodes.OK
  );
};
