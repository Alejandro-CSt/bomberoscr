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

const IncidentDispatchedVehicleSchema = z.object({
  internalNumber: z.string(),
  dispatchTime: z.string().nullable(),
  arrivalTime: z.string().nullable(),
  departureTime: z.string().nullable()
});

const IncidentDispatchedStationSummarySchema = z.object({
  name: z.string(),
  stationKey: z.string(),
  isResponsible: z.boolean(),
  vehicles: z.array(IncidentDispatchedVehicleSchema)
});

export const IncidentDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  incidentTimestamp: z.string(),
  dispatchType: z.string(),
  actualType: z.string().nullable(),
  address: z.string().nullable(),
  isOpen: z.boolean(),
  modifiedAt: z.string().nullable(),
  cantonName: z.string().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  hasMapImage: z.boolean(),
  dispatchedStations: z.array(IncidentDispatchedStationSummarySchema)
});

export const StatisticsSchema = z.object({
  currentYear: z.number(),
  currentYearCount: z.number(),
  currentYearCantonCount: z.number(),
  previousYear: z.number(),
  previousYearCount: z.number()
});

export const IncidentDetailResponseSchema = z.object({
  incident: IncidentDetailSchema,
  statistics: StatisticsSchema
});

export const IncidentTimelineEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  description: z.string().optional()
});

export const IncidentTimelineResponseSchema = z.object({
  incidentId: z.number(),
  events: z.array(IncidentTimelineEventSchema)
});

export const IncidentResponseTimeItemSchema = z.object({
  id: z.number(),
  vehicle: z.string(),
  station: z.string(),
  dispatchedTime: z.string().nullable(),
  arrivalTime: z.string().nullable(),
  departureTime: z.string().nullable(),
  baseReturnTime: z.string().nullable(),
  responseTimeSeconds: z.number(),
  onSceneTimeSeconds: z.number(),
  returnTimeSeconds: z.number(),
  totalTimeSeconds: z.number(),
  isEnRoute: z.boolean()
});

export const IncidentResponseTimesResponseSchema = z.object({
  incidentId: z.number(),
  isOpen: z.boolean(),
  vehicles: z.array(IncidentResponseTimeItemSchema)
});

export type IncidentListItem = z.infer<typeof IncidentListItemSchema>;
export type IncidentMapItem = z.infer<typeof IncidentMapItemSchema>;

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

export const MapOriginalTokenSchema = z.object({
  token: z.string()
});

export type HighlightedIncidentItem = z.infer<typeof HighlightedIncidentItemSchema>;
