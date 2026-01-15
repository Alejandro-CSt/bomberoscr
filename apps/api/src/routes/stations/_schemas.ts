import { z } from "@hono/zod-openapi";

export const StationsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.coerce.number().optional(),
  search: z.string().trim().optional(),
  isOperative: z.coerce.boolean().optional(),
  view: z.enum(["default", "map"]).default("default")
});

export const StationKeyParamSchema = z.object({
  key: z.string().openapi({
    param: { name: "key", in: "path", required: true },
    example: "SJ-01"
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
  stationKey: z.string(),
  latitude: z.string(),
  longitude: z.string()
});

export const StationsDefaultResponseSchema = z.object({
  view: z.literal("default"),
  stations: z.array(StationListItemSchema),
  nextCursor: z.number().nullable()
});

export const StationsMapResponseSchema = z.object({
  view: z.literal("map"),
  stations: z.array(StationMapItemSchema)
});

export const StationsResponseSchema = z.discriminatedUnion("view", [
  StationsDefaultResponseSchema,
  StationsMapResponseSchema
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
