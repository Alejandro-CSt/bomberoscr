import z from "zod";

export const SearchIncidentsFormSchema = z.object({
  incidentTypeCodes: z.array(z.string()).max(3),
  stationIds: z.array(z.string()).max(3),
  timeRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  bounds: z
    .object({
      minLat: z.number(),
      minLng: z.number(),
      maxLat: z.number(),
      maxLng: z.number()
    })
    .nullish()
});

export const SearchIncidentsInputSchema = z.object({
  incidentTypeCodes: z.array(z.string()).max(3),
  stationIds: z.array(z.string()).max(3),
  timeRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
  }),
  bounds: z
    .object({
      minLat: z.number(),
      minLng: z.number(),
      maxLat: z.number(),
      maxLng: z.number()
    })
    .nullish()
});

export type SearchIncidentsInput = z.infer<typeof SearchIncidentsInputSchema>;
export type SearchIncidentsForm = z.infer<typeof SearchIncidentsFormSchema>;
