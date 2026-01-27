import { db, ilike } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { createRoute } from "@hono/zod-openapi";
import { and, asc, count, eq, or, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { StationsQuerySchema, StationsResponseSchema } from "@/routers/stations/_schemas";

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

// Natural sort for station keys like "1-1", "1-2", "1-10", "2-1"
const stationKeyNaturalSort = sql`
  CAST(SPLIT_PART(${stations.stationKey}, '-', 1) AS INTEGER),
  CAST(SPLIT_PART(${stations.stationKey}, '-', 2) AS INTEGER)
`;

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { limit, page, search, isOperative, view } = c.req.valid("query");

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
        name: stations.name,
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

  if (view === "directory") {
    const whereClause = buildWhereClause([eq(stations.isOperative, true)]);

    const results = await db
      .select({
        stationKey: stations.stationKey,
        name: stations.name,
        address: stations.address
      })
      .from(stations)
      .where(whereClause)
      .orderBy(stationKeyNaturalSort);

    return c.json(
      {
        view: "directory" as const,
        stations: results
      },
      HttpStatusCodes.OK
    );
  }

  const whereClause = buildWhereClause(baseFilters);
  const offset = (page - 1) * limit;

  // Run both queries in parallel for efficiency
  const [results, countResult] = await Promise.all([
    db
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
      .orderBy(asc(stations.name))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(stations).where(whereClause)
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return c.json(
    {
      view: "default" as const,
      stations: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    },
    HttpStatusCodes.OK
  );
};
