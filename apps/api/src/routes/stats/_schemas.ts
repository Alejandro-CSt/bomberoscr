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
