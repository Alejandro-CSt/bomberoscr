import { z } from "@hono/zod-openapi";

import { stringBoolean } from "@/lib/zod-utils";

const incidentTypeSchema = z
  .object({
    code: z.string().openapi({
      description: "Type code.",
      example: "1"
    }),
    name: z.string().openapi({
      description: "Type name.",
      example: "EMERGENCIAS POR FUEGO"
    }),
    imageUrl: z.string().url().nullable().openapi({
      description: "URL to the type's icon image.",
      example: "https://api.example.com/types/1/image"
    })
  })
  .openapi({
    description: "Incident type object with code, name, and image URL"
  });

export const incidentByIdRequest = z.object({
  id: z.coerce.number().openapi({
    param: { name: "id", in: "path", required: true },
    example: 1550734
  })
});

export const incidentsListRequest = z.object({
  cursor: z.coerce
    .number()
    .nullable()
    .optional()
    .openapi({
      description: "A cursor for pagination, representing the last item from the previous page.",
      param: { in: "query" },
      example: 1550734
    }),
  sort: z
    .array(z.string().min(1))
    .max(2)
    .min(2)
    .nullable()
    .optional()
    .openapi({
      description: "Sorting order as a tuple: [field, direction]. Example: ['id', 'desc'].",
      param: { in: "query" },
      example: ["id", "desc"]
    }),
  pageSize: z.coerce
    .number()
    .min(1)
    .max(100)
    .optional()
    .openapi({
      description: "Number of incidents to return per page (1-100).",
      param: { in: "query" },
      example: 25
    }),
  q: z
    .string()
    .nullable()
    .optional()
    .openapi({
      description: "Search query string to filter incidents by text.",
      param: { in: "query" },
      example: "Acme"
    }),
  start: z
    .string()
    .nullable()
    .optional()
    .openapi({
      description: "Start date (inclusive) for filtering incidents, in ISO 8601 format.",
      param: { in: "query" },
      example: "2024-01-01"
    }),
  end: z
    .string()
    .nullable()
    .optional()
    .openapi({
      description: "End date (inclusive) for filtering incidents, in ISO 8601 format.",
      param: { in: "query" },
      example: "2024-01-31"
    }),
  stations: z.coerce
    .number()
    .or(z.array(z.coerce.number()))
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional()
    .openapi({
      description: "List of station IDs to filter incidents.",
      param: { in: "query" },
      example: [43, 44]
    }),
  ids: z.coerce
    .number()
    .or(z.array(z.coerce.number()))
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional()
    .openapi({
      description: "List of incident IDs to filter incidents.",
      param: { in: "query" },
      example: [1550734, 1550735]
    }),
  types: z
    .string()
    .or(z.array(z.string()))
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional()
    .openapi({
      description: "List of incident types to filter incidents.",
      param: { in: "query" },
      example: ["6.1.1.2.1", "1.2.1"]
    }),
  open: stringBoolean
    .nullable()
    .optional()
    .openapi({
      description: "Filter by open status. true: only open incidents, false: only closed incidents",
      param: { in: "query" },
      example: true
    }),
  bounds: z
    .object({
      north: z.coerce.number(),
      south: z.coerce.number(),
      east: z.coerce.number(),
      west: z.coerce.number()
    })
    .nullable()
    .optional()
    .openapi({
      description: "Bounding box for filtering incidents by location.",
      param: { in: "query" },
      example: {
        north: 9.9715,
        south: 9.8986,
        east: -84.0356,
        west: -84.1559
      }
    })
});

export const dispatchedVehicleSchema = z
  .object({
    id: z.number().openapi({
      description: "The vehicle ID.",
      example: 3527
    }),
    internalNumber: z.string().openapi({
      description: "The internal vehicle number.",
      example: "M-46"
    }),
    plate: z.string().openapi({
      description: "The vehicle plate number.",
      example: "341-527"
    }),
    type: z.string().openapi({
      description: "The vehicle type.",
      example: "EMERGENCIA"
    }),
    dispatchedTime: z.string().openapi({
      description: "Time when the vehicle was dispatched.",
      example: "2025-11-23T23:19:44.000Z"
    }),
    arrivalTime: z.string().nullable().openapi({
      description: "Time when the vehicle arrived at the scene.",
      example: "2025-11-23T23:27:14.000Z"
    }),
    departureTime: z.string().nullable().openapi({
      description: "Time when the vehicle departed from the scene.",
      example: "2025-11-26T04:36:42.000Z"
    }),
    baseReturnTime: z.string().nullable().openapi({
      description: "Time when the vehicle returned to base.",
      example: null
    })
  })
  .openapi({
    description: "Dispatched vehicle object"
  });

const dispatchedStationSchema = z
  .object({
    name: z.string().openapi({
      description: "The station name.",
      example: "DESAMPARADOS"
    }),
    stationKey: z.string().openapi({
      description: "The station key.",
      example: "desamparados"
    }),
    isResponsible: z.boolean().openapi({
      description: "Whether the station is responsible for the incident.",
      example: true
    }),
    vehicles: z.array(dispatchedVehicleSchema).openapi({
      description: "Vehicles dispatched from this station."
    })
  })
  .openapi({
    description: "Dispatched station"
  });

export const incidentByIdResponse = z
  .object({
    id: z.number().openapi({
      description: "The ID of the incident.",
      example: 1550734
    }),
    isOpen: z.boolean().openapi({
      description: "Whether the incident is currently open.",
      example: false
    }),
    EEConsecutive: z.string().openapi({
      description: "The consecutive number of the incident.",
      example: "45470-2025"
    }),
    address: z.string().openapi({
      description: "The address of the incident.",
      example:
        "SAN JOSE DESAMPARADOS SAN RAFAEL ARRIBA DETRAS DE LA ESCUELA MANUEL ORTUÑO EN LA ZONA FRANCA LAS BRISAS EN BODEGAS"
    }),
    incidentTimestamp: z.string().openapi({
      description: "The timestamp of the incident.",
      example: "2025-11-23T23:18:07.000Z"
    }),
    importantDetails: z.string().openapi({
      description: "The important details of the incident.",
      example: "BODEGAS CERRADAS"
    }),
    mapImageUrl: z.string().url().nullable().openapi({
      description: "URL to the incident's map image.",
      example: "https://api.example.com/incidents/1550734/map"
    }),
    dispatchType: incidentTypeSchema.nullable().openapi({
      description: "General type assigned by dispatch."
    }),
    specificDispatchType: incidentTypeSchema.nullable().openapi({
      description: "Specific type assigned by dispatch."
    }),
    actualType: incidentTypeSchema.nullable().openapi({
      description: "Actual general type (set by firefighters on scene)."
    }),
    specificActualType: incidentTypeSchema.nullable().openapi({
      description: "Actual specific type (set by firefighters on scene)."
    })
  })
  .extend({
    dispatchedStations: z.array(dispatchedStationSchema).openapi({
      description: "Stations dispatched to the incident."
    })
  })
  .openapi({
    description: "Incident object"
  });

export const incidentsListResponse = z
  .object({
    meta: z
      .object({
        cursor: z.number().nullable().openapi({
          description: "Cursor for pagination; null if there is no next page",
          example: 1550734
        }),
        hasPreviousPage: z.boolean().openapi({
          description: "Indicates if there is a previous page of results",
          example: false
        }),
        hasNextPage: z.boolean().openapi({
          description: "Indicates if there is a next page of results",
          example: true
        })
      })
      .openapi({
        description: "Pagination metadata"
      }),
    data: z
      .array(
        incidentByIdResponse.omit({ dispatchedStations: true }).extend({
          dispatchedStationsCount: z.number().openapi({
            description: "Number of stations dispatched to the incident.",
            example: 3
          }),
          dispatchedVehiclesCount: z.number().openapi({
            description: "Number of vehicles dispatched to the incident.",
            example: 5
          })
        })
      )
      .openapi({
        description: "Array of incident list items"
      })
  })
  .openapi({
    description: "Response containing a list of incidents and pagination metadata"
  });

export const incidentResponseTimeItemSchema = z
  .object({
    id: z.number().openapi({
      description: "The vehicle dispatch ID.",
      example: 1285917
    }),
    vehicle: z.string().openapi({
      description: "The vehicle internal number.",
      example: "M-05"
    }),
    station: z.string().openapi({
      description: "The station name.",
      example: "METROPOLITANA SUR"
    }),
    dispatchedTime: z.string().nullable().openapi({
      description: "Time when the vehicle was dispatched.",
      example: "2025-11-23T17:22:06.000Z"
    }),
    arrivalTime: z.string().nullable().openapi({
      description: "Time when the vehicle arrived at the scene.",
      example: "2025-11-23T17:27:15.000Z"
    }),
    departureTime: z.string().nullable().openapi({
      description: "Time when the vehicle departed from the scene.",
      example: "2025-11-25T04:00:25.000Z"
    }),
    baseReturnTime: z.string().nullable().openapi({
      description: "Time when the vehicle returned to base.",
      example: "2025-11-25T04:32:40.000Z"
    }),
    responseTimeSeconds: z.number().openapi({
      description: "Time in seconds from dispatch to arrival.",
      example: 309
    }),
    onSceneTimeSeconds: z.number().openapi({
      description: "Time in seconds the vehicle was on scene.",
      example: 124390
    }),
    returnTimeSeconds: z.number().openapi({
      description: "Time in seconds from departure to base return.",
      example: 1935
    }),
    totalTimeSeconds: z.number().openapi({
      description: "Total time in seconds (response + on scene + return).",
      example: 126634
    }),
    isEnRoute: z.boolean().openapi({
      description: "Whether the vehicle is still en route (departed but not returned).",
      example: false
    })
  })
  .openapi({
    description: "Vehicle response time data"
  });

export const incidentResponseTimesResponseSchema = z
  .object({
    vehicles: z.array(incidentResponseTimeItemSchema).openapi({
      description: "Array of vehicle response time data."
    })
  })
  .openapi({
    description: "Response time breakdown for dispatched vehicles",
    example: {
      vehicles: [
        {
          id: 1285917,
          vehicle: "M-05",
          station: "METROPOLITANA SUR",
          dispatchedTime: "2025-11-23T17:22:06.000Z",
          arrivalTime: "2025-11-23T17:27:15.000Z",
          departureTime: "2025-11-25T04:00:25.000Z",
          baseReturnTime: "2025-11-25T04:32:40.000Z",
          responseTimeSeconds: 309,
          onSceneTimeSeconds: 124390,
          returnTimeSeconds: 1935,
          totalTimeSeconds: 126634,
          isEnRoute: false
        }
      ]
    }
  });

export const incidentTimelineEventSchema = z.object({
  id: z.string().openapi({
    example: "dispatch|all-dispatches|1763918355000|M-133-M-46-T-02-M-05-AMBULANCIA-03-V-141-M-32"
  }),
  date: z.string().openapi({
    example: "2025-11-23T17:19:15.000Z"
  }),
  title: z.string().openapi({
    example: "Despachados: M-133, M-46, T-02, M-05, AMBULANCIA-03, V-141, M-32"
  }),
  description: z.string().optional().openapi({
    example: "DESAMPARADOS, METROPOLITANA SUR, METROPOLITANA NORTE, SANTO DOMINGO"
  })
});

export const incidentTimelineResponseSchema = z.object({
  events: z.array(incidentTimelineEventSchema)
});
