import { z } from "zod";

export const ALLOWED_TIME_RANGE_VALUES = [7, 30, 90, 365] as const;
export const DEFAULT_TIME_RANGE = 30;

export const TIME_RANGE_LABELS = {
  7: "7 días",
  30: "1 mes",
  90: "3 meses",
  365: "1 año"
} as const;

export const timeRangeSearchSchema = z.object({
  timeRange: z
    .union([z.literal(7), z.literal(30), z.literal(90), z.literal(365)])
    .catch(DEFAULT_TIME_RANGE)
});
