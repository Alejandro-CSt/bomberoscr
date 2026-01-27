import { z } from "zod";

export const incidentsSortOptions = [
  "id",
  "vehiclesDispatched",
  "stationsDispatched",
  "totalDispatched"
] as const;

export type IncidentsSortOption = (typeof incidentsSortOptions)[number];

export const incidentsSortOrderOptions = ["asc", "desc"] as const;

export type IncidentsSortOrder = (typeof incidentsSortOrderOptions)[number];

export const incidentsSearchSchemaWithDefaults = z.object({
  isMapVisible: z.boolean().catch(true),
  mapZoom: z.number().catch(8),
  mapNorth: z.number().optional(),
  mapSouth: z.number().optional(),
  mapEast: z.number().optional(),
  mapWest: z.number().optional(),
  cursor: z.string().catch(""),
  sort: z.enum(incidentsSortOptions).catch("id"),
  sortOrder: z.enum(incidentsSortOrderOptions).catch("desc"),
  startDate: z.string().catch(""),
  endDate: z.string().catch(""),
  stationIds: z.array(z.number()).optional().catch(undefined),
  incidentCodes: z.array(z.string()).optional().catch(undefined)
});

export type IncidentsSearch = z.infer<typeof incidentsSearchSchemaWithDefaults>;

export const incidentsQuerySchema = z
  .object({
    mapNorth: z.coerce.number().min(-90).max(90).optional(),
    mapSouth: z.coerce.number().min(-90).max(90).optional(),
    mapEast: z.coerce.number().min(-180).max(180).optional(),
    mapWest: z.coerce.number().min(-180).max(180).optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.enum(incidentsSortOptions).default("id"),
    sortOrder: z.enum(incidentsSortOrderOptions).default("desc"),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    stationIds: z
      .string()
      .optional()
      .transform((v) => (v ? v.split(",").map(Number) : [])),
    incidentCodes: z
      .string()
      .optional()
      .transform((v) => (v ? v.split(",") : [])),
    includeCount: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true")
  })
  .refine(
    (data) => {
      const bounds = [data.mapNorth, data.mapSouth, data.mapEast, data.mapWest];
      const providedCount = bounds.filter((b) => b !== undefined).length;
      return providedCount === 0 || providedCount === 4;
    },
    { message: "Map bounds must include all four values (north, south, east, west) or none" }
  )
  .refine(
    (data) => {
      if (data.mapNorth === undefined || data.mapSouth === undefined) return true;
      return data.mapNorth > data.mapSouth;
    },
    { message: "mapNorth must be greater than mapSouth" }
  )
  .refine(
    (data) => {
      if (data.startDate === undefined || data.endDate === undefined) return true;
      return data.startDate <= data.endDate;
    },
    { message: "startDate must be before or equal to endDate" }
  )
  .transform((data) => {
    const { mapNorth, mapSouth, mapEast, mapWest, ...rest } = data;
    const mapBounds =
      mapNorth !== undefined &&
      mapSouth !== undefined &&
      mapEast !== undefined &&
      mapWest !== undefined
        ? { north: mapNorth, south: mapSouth, east: mapEast, west: mapWest }
        : undefined;
    return { ...rest, mapBounds };
  });

export type IncidentsQuery = z.infer<typeof incidentsQuerySchema>;
