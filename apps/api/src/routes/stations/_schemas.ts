import { z } from "@hono/zod-openapi";

export const StationsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
  search: z.string().trim().optional(),
  isOperative: z.coerce.boolean().optional(),
  view: z.enum(["default", "map", "directory"]).default("default")
});

export const StationKeyParamSchema = z.object({
  key: z.string().openapi({
    param: { name: "key", in: "path", required: true },
    example: "SJ-01"
  })
});

export const StationNameParamSchema = z.object({
  name: z.string().openapi({
    param: { name: "name", in: "path", required: true },
    example: "Bomberos%20de%20San%20Jos%C3%A9"
  })
});

export const StationListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  stationKey: z.string(),
  address: z.string().nullable(),
  latitude: z.string(),
  longitude: z.string(),
  isOperative: z.boolean().nullable()
});

export const StationMapItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  stationKey: z.string(),
  latitude: z.string(),
  longitude: z.string()
});

export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
});

export const StationsDefaultResponseSchema = z.object({
  view: z.literal("default"),
  stations: z.array(StationListItemSchema),
  pagination: PaginationSchema
});

export const StationsMapResponseSchema = z.object({
  view: z.literal("map"),
  stations: z.array(StationMapItemSchema)
});

export const StationDirectoryItemSchema = z.object({
  stationKey: z.string(),
  name: z.string(),
  address: z.string().nullable()
});

export const StationsDirectoryResponseSchema = z.object({
  view: z.literal("directory"),
  stations: z.array(StationDirectoryItemSchema)
});

export const StationsResponseSchema = z.discriminatedUnion("view", [
  StationsDefaultResponseSchema,
  StationsMapResponseSchema,
  StationsDirectoryResponseSchema
]);

export const StationDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  stationKey: z.string(),
  radioChannel: z.string().nullable(),
  latitude: z.string(),
  longitude: z.string(),
  address: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  fax: z.string().nullable(),
  email: z.string().nullable(),
  isOperative: z.boolean().nullable()
});

export const StationDetailResponseSchema = z.object({
  station: StationDetailSchema
});

export const StationImageTokenSchema = z.object({
  token: z.string()
});

export const StationHighlightedIncidentSchema = z.object({
  id: z.number(),
  incidentTimestamp: z.string(),
  details: z.string().nullable(),
  address: z.string().nullable(),
  responsibleStation: z.string().nullable(),
  latitude: z.string(),
  longitude: z.string(),
  dispatchedVehiclesCount: z.number(),
  dispatchedStationsCount: z.number()
});

export const StationHighlightedIncidentsResponseSchema = z.object({
  incidents: z.array(StationHighlightedIncidentSchema)
});

export const StationHeatmapDataPointSchema = z.object({
  date: z.string(),
  count: z.number()
});

export const StationHeatmapResponseSchema = z.object({
  data: z.array(StationHeatmapDataPointSchema),
  totalIncidents: z.number()
});

export const StationRecentIncidentSchema = z.object({
  id: z.number(),
  incidentTimestamp: z.string(),
  address: z.string().nullable(),
  importantDetails: z.string().nullable(),
  responsibleStation: z.string().nullable(),
  latitude: z.string(),
  longitude: z.string(),
  dispatchedVehiclesCount: z.number(),
  dispatchedStationsCount: z.number()
});

export const StationRecentIncidentsResponseSchema = z.object({
  incidents: z.array(StationRecentIncidentSchema)
});

export const StationCollaborationSchema = z.object({
  id: z.number(),
  name: z.string(),
  stationKey: z.string(),
  collaborationCount: z.number()
});

export const StationCollaborationsResponseSchema = z.object({
  collaborations: z.array(StationCollaborationSchema)
});

export const StationVehicleStatsSchema = z.object({
  incidentCount: z.number(),
  avgResponseTimeSeconds: z.number().nullable()
});

export const StationVehicleSchema = z.object({
  id: z.number(),
  internalNumber: z.string().nullable(),
  plate: z.string().nullable(),
  descriptionType: z.string().nullable(),
  class: z.string().nullable(),
  descriptionOperationalStatus: z.string().nullable(),
  stats: StationVehicleStatsSchema
});

export const StationVehiclesResponseSchema = z.object({
  vehicles: z.array(StationVehicleSchema)
});
