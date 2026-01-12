import { z } from "@hono/zod-openapi";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const IncidentsQuerySchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).default(20),
    cursor: z.coerce.number().optional(),
    station: z.string().nullish(),
    view: z.enum(["default", "map"]).default("default"),
    sortBy: z.enum(["id", "incidentTimestamp"]).default("id"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional()
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const diff = data.endTime.getTime() - data.startTime.getTime();
        if (diff < 0) return false;
        if (data.view === "map" && diff > THREE_DAYS_MS) return false;
      }
      return true;
    },
    {
      message: "Time range must be positive (and not exceed 3 days for map view)",
      path: ["startTime", "endTime"]
    }
  );

export const IncidentIdParamSchema = z.object({
  id: z.coerce.number().openapi({
    param: { name: "id", in: "path", required: true },
    example: 1556825
  })
});

export const IncidentListItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  isOpen: z.boolean(),
  EEConsecutive: z.string().nullable(),
  address: z.string().nullable(),
  incidentTimestamp: z.string(),
  importantDetails: z.string().nullable(),
  specificIncidentCode: z.string().nullable(),
  incidentType: z.string().nullable(),
  responsibleStation: z.string().nullable(),
  specificIncidentType: z.string().nullable(),
  dispatchedVehiclesCount: z.number(),
  dispatchedStationsCount: z.number()
});

export const IncidentMapItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  latitude: z.string(),
  longitude: z.string()
});

export const IncidentsDefaultResponseSchema = z.object({
  view: z.literal("default"),
  incidents: z.array(IncidentListItemSchema),
  nextCursor: z.number().nullable()
});

export const IncidentsMapResponseSchema = z.object({
  view: z.literal("map"),
  incidents: z.array(IncidentMapItemSchema)
});

export const IncidentsResponseSchema = z.discriminatedUnion("view", [
  IncidentsDefaultResponseSchema,
  IncidentsMapResponseSchema
]);

const LocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string()
});

const StationSchema = z.object({
  id: z.number(),
  name: z.string(),
  stationKey: z.string(),
  address: z.string().nullable(),
  latitude: z.string(),
  longitude: z.string()
});

const DispatchedStationSchema = z.object({
  id: z.number(),
  attentionOnFoot: z.boolean(),
  serviceTypeId: z.number().nullable(),
  station: StationSchema
});

const VehicleSchema = z.object({
  id: z.number(),
  internalNumber: z.string(),
  class: z.string()
});

const DispatchedVehicleSchema = z.object({
  id: z.number(),
  dispatchedTime: z.string(),
  arrivalTime: z.string(),
  departureTime: z.string(),
  baseReturnTime: z.string(),
  attentionOnFoot: z.boolean().nullable(),
  vehicle: VehicleSchema.nullable(),
  station: z.object({ name: z.string() })
});

const IncidentTypeNameSchema = z.object({ name: z.string() }).nullable();

export const IncidentDetailSchema = z.object({
  id: z.number(),
  incidentCode: z.string().nullable(),
  specificIncidentCode: z.string().nullable(),
  dispatchIncidentCode: z.string().nullable(),
  specificDispatchIncidentCode: z.string().nullable(),
  EEConsecutive: z.string(),
  address: z.string(),
  responsibleStation: z.number().nullable(),
  incidentTimestamp: z.string(),
  importantDetails: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  provinceId: z.number().nullable(),
  cantonId: z.number().nullable(),
  districtId: z.number().nullable(),
  isOpen: z.boolean(),
  modifiedAt: z.string(),
  province: LocationSchema.nullable(),
  canton: LocationSchema.extend({ provinceId: z.number() }).nullable(),
  district: LocationSchema.extend({ cantonId: z.number() }).nullable(),
  dispatchedStations: z.array(DispatchedStationSchema),
  dispatchedVehicles: z.array(DispatchedVehicleSchema),
  dispatchIncidentType: IncidentTypeNameSchema,
  specificDispatchIncidentType: IncidentTypeNameSchema,
  incidentType: IncidentTypeNameSchema,
  specificIncidentType: IncidentTypeNameSchema
});

export const StatisticsSchema = z.object({
  typeRankInYear: z.number(),
  typeRankInCanton: z.number(),
  districtIncidentsThisYear: z.number(),
  typeCountPreviousYear: z.number(),
  year: z.number()
});

export const IncidentDetailResponseSchema = z.object({
  incident: IncidentDetailSchema,
  statistics: StatisticsSchema
});

export type IncidentListItem = z.infer<typeof IncidentListItemSchema>;
export type IncidentMapItem = z.infer<typeof IncidentMapItemSchema>;

// Highlighted incidents schemas
export const HighlightedIncidentsQuerySchema = z.object({
  timeRange: z.coerce
    .number()
    .refine((val) => val === 7 || val === 30 || val === 90 || val === 365, {
      message: "Time range must be one of: 7, 30, 90, 365"
    })
    .default(30)
});

export const HighlightedIncidentItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  incidentTimestamp: z.string(),
  details: z.string(),
  address: z.string(),
  responsibleStation: z.string(),
  dispatchedVehiclesCount: z.number(),
  dispatchedStationsCount: z.number(),
  hasMapImage: z.boolean()
});

export const HighlightedIncidentsResponseSchema = z.object({
  incidents: z.array(HighlightedIncidentItemSchema)
});

export type HighlightedIncidentItem = z.infer<typeof HighlightedIncidentItemSchema>;
