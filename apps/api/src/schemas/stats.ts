import { z } from "@hono/zod-openapi";

// ============================================================================
// Date Range Helpers
// ============================================================================

const MAX_DAYS = 365;

function validateDateRange(start: string | null, end: string | null) {
  if (!start || !end) return true;

  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= MAX_DAYS;
}

const dateRangeBase = {
  start: z
    .string()
    .nullable()
    .optional()
    .openapi({
      description: "Start date (inclusive) for filtering, in ISO 8601 format.",
      param: { in: "query" },
      example: "2024-01-01"
    }),
  end: z
    .string()
    .nullable()
    .optional()
    .openapi({
      description: "End date (inclusive) for filtering, in ISO 8601 format.",
      param: { in: "query" },
      example: "2024-01-31"
    })
};

// ============================================================================
// Year Recap
// ============================================================================

export const yearRecapRequest = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2020)
    .max(2100)
    .optional()
    .default(new Date().getFullYear())
    .openapi({
      description: "Year to get recap for.",
      param: { in: "query" },
      example: 2025
    })
});

export const yearRecapResponse = z
  .object({
    year: z.number().openapi({
      description: "The year of the recap.",
      example: 2025
    }),
    totalIncidents: z.number().openapi({
      description: "Total number of incidents for the year.",
      example: 42500
    }),
    frequency: z.number().nullable().openapi({
      description: "Average minutes between incidents.",
      example: 12
    }),
    busiestDate: z
      .object({
        date: z.string().openapi({
          description: "Date in YYYY-MM-DD format.",
          example: "2025-03-15"
        }),
        count: z.number().openapi({
          description: "Number of incidents on that date.",
          example: 245
        })
      })
      .nullable()
      .openapi({
        description: "Date with the most incidents."
      }),
    busiestStation: z
      .object({
        name: z.string().openapi({
          description: "Station name.",
          example: "METROPOLITANA SUR"
        }),
        count: z.number().openapi({
          description: "Number of dispatches.",
          example: 3500
        })
      })
      .nullable()
      .openapi({
        description: "Station with the most dispatches."
      }),
    busiestVehicle: z
      .object({
        internalNumber: z.string().openapi({
          description: "Vehicle internal number.",
          example: "M-05"
        }),
        count: z.number().openapi({
          description: "Number of dispatches.",
          example: 1200
        })
      })
      .nullable()
      .openapi({
        description: "Vehicle with the most dispatches."
      }),
    mostPopularIncidentType: z
      .object({
        name: z.string().openapi({
          description: "Incident type name.",
          example: "EMERGENCIAS MÉDICAS"
        }),
        count: z.number().openapi({
          description: "Number of incidents of this type.",
          example: 15000
        })
      })
      .nullable()
      .openapi({
        description: "Most common incident type."
      })
  })
  .openapi({
    description: "Year-to-date statistics about emergency response"
  });

// ============================================================================
// Top Dispatched Stations
// ============================================================================

export const topDispatchedStationsRequest = z
  .object(dateRangeBase)
  .refine((data) => validateDateRange(data.start ?? null, data.end ?? null), {
    message: `Date range cannot exceed ${MAX_DAYS} days`,
    path: ["end"]
  });

export const topDispatchedStationsResponse = z
  .array(
    z.object({
      name: z.string().openapi({
        description: "Station name.",
        example: "METROPOLITANA SUR"
      }),
      key: z.string().nullable().openapi({
        description: "Station key.",
        example: "1-1"
      }),
      total: z.number().openapi({
        description: "Total dispatches.",
        example: 450
      }),
      responsible: z.number().openapi({
        description: "Dispatches as responsible station.",
        example: 380
      }),
      support: z.number().openapi({
        description: "Dispatches as support station.",
        example: 70
      })
    })
  )
  .openapi({
    description: "Top dispatched stations by count"
  });

// ============================================================================
// Top Response Times
// ============================================================================

export const topResponseTimesRequest = z
  .object(dateRangeBase)
  .refine((data) => validateDateRange(data.start ?? null, data.end ?? null), {
    message: `Date range cannot exceed ${MAX_DAYS} days`,
    path: ["end"]
  });

export const topResponseTimesResponse = z
  .array(
    z.object({
      name: z.string().openapi({
        description: "Station name.",
        example: "METROPOLITANA SUR"
      }),
      key: z.string().nullable().openapi({
        description: "Station key.",
        example: "1-1"
      }),
      avgResponseTimeMinutes: z.number().openapi({
        description: "Average response time in minutes.",
        example: 8.5
      }),
      totalDispatches: z.number().openapi({
        description: "Total number of dispatches.",
        example: 1500
      }),
      fastestResponseMinutes: z.number().openapi({
        description: "Fastest response time in minutes.",
        example: 2.1
      }),
      slowestResponseMinutes: z.number().openapi({
        description: "Slowest response time in minutes.",
        example: 45.3
      }),
      category: z.enum(["fastest", "slowest", "average"]).openapi({
        description: "Category of the station in the ranking.",
        example: "fastest"
      })
    })
  )
  .openapi({
    description: "Station response time rankings (fastest, slowest, and national average)"
  });

// ============================================================================
// Incidents by Day of Week
// ============================================================================

export const incidentsByDayOfWeekRequest = z
  .object(dateRangeBase)
  .refine((data) => validateDateRange(data.start ?? null, data.end ?? null), {
    message: `Date range cannot exceed ${MAX_DAYS} days`,
    path: ["end"]
  });

export const incidentsByDayOfWeekResponse = z
  .array(
    z.object({
      dayOfWeek: z.string().openapi({
        description: "Day of the week in Spanish.",
        example: "Lunes"
      }),
      count: z.number().openapi({
        description: "Number of incidents on that day.",
        example: 1250
      })
    })
  )
  .openapi({
    description: "Incidents distribution by day of week"
  });

// ============================================================================
// Incidents by Hour
// ============================================================================

export const incidentsByHourRequest = z
  .object(dateRangeBase)
  .refine((data) => validateDateRange(data.start ?? null, data.end ?? null), {
    message: `Date range cannot exceed ${MAX_DAYS} days`,
    path: ["end"]
  });

export const incidentsByHourResponse = z
  .array(
    z.object({
      hour: z.number().openapi({
        description: "Hour of the day (0-23).",
        example: 14
      }),
      count: z.number().openapi({
        description: "Number of incidents at that hour.",
        example: 520
      }),
      displayHour: z.string().openapi({
        description: "Formatted hour display.",
        example: "14:00"
      })
    })
  )
  .openapi({
    description: "Incidents distribution by hour of day"
  });

// ============================================================================
// Daily Incidents
// ============================================================================

export const dailyIncidentsRequest = z
  .object(dateRangeBase)
  .refine((data) => validateDateRange(data.start ?? null, data.end ?? null), {
    message: `Date range cannot exceed ${MAX_DAYS} days`,
    path: ["end"]
  });

export const dailyIncidentsResponse = z
  .object({
    data: z.array(
      z.object({
        date: z.string().openapi({
          description: "Date in YYYY-MM-DD format.",
          example: "2025-01-15"
        }),
        dayOffset: z.number().openapi({
          description: "Day offset from start of range.",
          example: 1
        }),
        current: z.number().openapi({
          description: "Incidents in current period.",
          example: 145
        }),
        previous: z.number().openapi({
          description: "Incidents in previous period.",
          example: 130
        }),
        displayDate: z.string().openapi({
          description: "Formatted date display.",
          example: "15 ene"
        })
      })
    ),
    summary: z.object({
      currentTotal: z.number().openapi({
        description: "Total incidents in current period.",
        example: 4350
      }),
      previousTotal: z.number().openapi({
        description: "Total incidents in previous period.",
        example: 4100
      }),
      percentageChange: z.number().openapi({
        description: "Percentage change between periods.",
        example: 6.1
      })
    })
  })
  .openapi({
    description: "Daily incidents comparison between current and previous period"
  });

// ============================================================================
// System Overview
// ============================================================================

export const systemOverviewResponse = z
  .object({
    stationCount: z.number().openapi({
      description: "Number of operative stations.",
      example: 127
    }),
    activeVehicleCount: z.number().openapi({
      description: "Number of active vehicles.",
      example: 450
    }),
    avgResponseTimeMinutes: z.number().nullable().openapi({
      description: "Average response time in minutes over last 30 days.",
      example: 9.5
    })
  })
  .openapi({
    description: "System overview statistics"
  });
