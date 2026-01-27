import { z, type z as zType } from "@hono/zod-openapi";

import type { z as z4 } from "zod/v4";

export function toZodV4SchemaTyped<T extends z4.ZodTypeAny>(schema: T) {
  return schema as unknown as zType.ZodType<z4.infer<T>>;
}

/**
 * A Zod schema for boolean query parameters.
 * Accepts "true" or "false" strings and transforms them to actual booleans.
 */
export const stringBoolean = z
  .string()
  .refine((val) => val === "true" || val === "false", {
    message: "Must be 'true' or 'false'"
  })
  .transform((val) => val === "true");

/**
 * Creates a Zod schema for array query parameters.
 * Handles the case where a single value is passed as a string instead of an array.
 */
export function queryArray<T extends zType.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (val === undefined || val === null) return undefined;
    return [val];
  }, z.array(schema).optional());
}
