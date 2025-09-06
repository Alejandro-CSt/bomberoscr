import { and, between, db, desc, inArray, or, sql } from "@bomberoscr/db/index";
import { dispatchedStations, incidents } from "@bomberoscr/db/schema";
import { type SQL, ilike } from "drizzle-orm";

export type SearchBounds = {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
};

export type SearchFilters = {
  incidentTypeCodes?: string[];
  stationIds?: number[];
  start?: Date;
  end?: Date;
  limit?: number;
  bounds?: SearchBounds;
};

export type SearchIncidentCoordinate = {
  id: number;
  latitude: string;
  longitude: string;
};

export async function searchIncidentsCoordinates(
  filters: SearchFilters
): Promise<SearchIncidentCoordinate[]> {
  const whereClauses: SQL<unknown>[] = [];

  // Exclude invalid coordinates (0,0)
  whereClauses.push(sql`${incidents.latitude} <> '0'`);

  if (filters.start && filters.end) {
    const start = new Date(
      filters.start.getFullYear(),
      filters.start.getMonth(),
      filters.start.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      filters.end.getFullYear(),
      filters.end.getMonth(),
      filters.end.getDate(),
      23,
      59,
      59,
      999
    );
    whereClauses.push(between(incidents.incidentTimestamp, start, end));
  }

  if (filters.incidentTypeCodes && filters.incidentTypeCodes.length > 0) {
    for (const code of filters.incidentTypeCodes) {
      whereClauses.push(ilike(incidents.specificIncidentCode, code));
    }
  }

  // Station filtering (responsible station or dispatched station)
  if (filters.stationIds && filters.stationIds.length > 0) {
    const dispatched = await db
      .select({ incidentId: dispatchedStations.incidentId })
      .from(dispatchedStations)
      .where(inArray(dispatchedStations.stationId, filters.stationIds));

    const dispatchedIncidentIds = dispatched.map((d) => d.incidentId).filter((id) => id != null);

    const clauses: SQL<unknown>[] = [];
    if (filters.stationIds.length > 0) {
      clauses.push(inArray(incidents.responsibleStation, filters.stationIds));
    }
    if (dispatchedIncidentIds.length > 0) {
      clauses.push(inArray(incidents.id, dispatchedIncidentIds));
    }

    if (clauses.length > 0) {
      whereClauses.push(or(...(clauses as SQL<unknown>[])) as SQL<unknown>);
    }
  }

  // Viewport bounds filtering
  if (filters.bounds) {
    const { minLat, maxLat, minLng, maxLng } = filters.bounds;
    whereClauses.push(
      sql`(${incidents.latitude})::double precision BETWEEN ${minLat} AND ${maxLat}`
    );
    whereClauses.push(
      sql`(${incidents.longitude})::double precision BETWEEN ${minLng} AND ${maxLng}`
    );
  }

  const whereExpr: SQL<unknown> | undefined =
    whereClauses.length > 0 ? and(...whereClauses) : undefined;

  const rows = await db.query.incidents.findMany({
    columns: {
      id: true,
      latitude: true,
      longitude: true
    },
    where: whereExpr,
    orderBy: desc(incidents.id),
    limit: filters.limit ?? 500
  });

  return rows.map((r) => ({ id: r.id, latitude: r.latitude, longitude: r.longitude }));
}
