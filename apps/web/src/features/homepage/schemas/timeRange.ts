import { z } from "zod";

export const ALLOWED_TIME_RANGE_VALUES = [7, 30, 90, 365] as const;
export const DEFAULT_TIME_RANGE = 7;

export const TIME_RANGE_LABELS: Record<(typeof ALLOWED_TIME_RANGE_VALUES)[number], string> = {
  7: "7 días",
  30: "1 mes",
  90: "3 meses",
  365: "1 año"
} as const;

export const timeRangeSchema = z
  .number()
  .refine(
    (val) => ALLOWED_TIME_RANGE_VALUES.includes(val as (typeof ALLOWED_TIME_RANGE_VALUES)[number]),
    {
      message: `Time range must be one of: ${ALLOWED_TIME_RANGE_VALUES.join(", ")}`
    }
  );
