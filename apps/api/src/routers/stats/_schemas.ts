import { z } from "@hono/zod-openapi";

export const YearRecapQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional().default(new Date().getFullYear())
});

export const YearRecapResponseSchema = z.object({
  year: z.number(),
  totalIncidents: z.number(),
  frequency: z.number().nullable(),
  busiestDate: z
    .object({
      date: z.string(),
      count: z.number()
    })
    .nullable(),
  busiestStation: z
    .object({
      name: z.string(),
      count: z.number()
    })
    .nullable(),
  busiestVehicle: z
    .object({
      internalNumber: z.string(),
      count: z.number()
    })
    .nullable(),
  mostPopularIncidentType: z
    .object({
      name: z.string(),
      count: z.number()
    })
    .nullable()
});

export type YearRecapResponse = z.infer<typeof YearRecapResponseSchema>;

// Top Dispatched Stations schemas
export const TopDispatchedStationsQuerySchema = z.object({
  timeRange: z.coerce.number().int().min(1).max(365).optional().default(30)
});

export const TopDispatchedStationsResponseSchema = z.array(
  z.object({
    name: z.string(),
    key: z.string().nullable(),
    total: z.number(),
    responsible: z.number(),
    support: z.number()
  })
);

export type TopDispatchedStationsResponse = z.infer<typeof TopDispatchedStationsResponseSchema>;

// Top Response Times schemas
export const TopResponseTimesQuerySchema = z.object({
  timeRange: z.coerce.number().int().min(1).max(730).optional().default(365)
});

export const TopResponseTimesResponseSchema = z.array(
  z.object({
    name: z.string(),
    key: z.string().nullable(),
    avgResponseTimeMinutes: z.number(),
    totalDispatches: z.number(),
    fastestResponseMinutes: z.number(),
    slowestResponseMinutes: z.number(),
    category: z.enum(["fastest", "slowest", "average"])
  })
);

export type TopResponseTimesResponse = z.infer<typeof TopResponseTimesResponseSchema>;

// Incidents by Day of Week schemas
export const IncidentsByDayOfWeekQuerySchema = z.object({
  timeRange: z.coerce.number().int().min(1).max(365).optional().default(30)
});

export const IncidentsByDayOfWeekResponseSchema = z.array(
  z.object({
    dayOfWeek: z.string(),
    count: z.number()
  })
);

export type IncidentsByDayOfWeekResponse = z.infer<typeof IncidentsByDayOfWeekResponseSchema>;

// Incidents by Hour schemas
export const IncidentsByHourQuerySchema = z.object({
  timeRange: z.coerce.number().int().min(1).max(365).optional().default(30)
});

export const IncidentsByHourResponseSchema = z.array(
  z.object({
    hour: z.number(),
    count: z.number(),
    displayHour: z.string()
  })
);

export type IncidentsByHourResponse = z.infer<typeof IncidentsByHourResponseSchema>;

// Daily Incidents schemas
export const DailyIncidentsQuerySchema = z.object({
  timeRange: z.coerce.number().int().min(1).max(365).optional().default(30)
});

export const DailyIncidentsResponseSchema = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      dayOffset: z.number(),
      current: z.number(),
      previous: z.number(),
      displayDate: z.string()
    })
  ),
  summary: z.object({
    currentTotal: z.number(),
    previousTotal: z.number(),
    percentageChange: z.number()
  })
});

export type DailyIncidentsResponse = z.infer<typeof DailyIncidentsResponseSchema>;

// System Overview schemas
export const SystemOverviewResponseSchema = z.object({
  stationCount: z.number(),
  activeVehicleCount: z.number(),
  avgResponseTimeMinutes: z.number().nullable()
});

export type SystemOverviewResponse = z.infer<typeof SystemOverviewResponseSchema>;
