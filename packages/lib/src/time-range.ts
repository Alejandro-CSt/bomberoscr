import { z } from "zod";

export const ALLOWED_TIME_RANGE_VALUES = [7, 30, 90, 365];
export const DEFAULT_TIME_RANGE = 30;

export const TIME_RANGE_LABELS = {
  7: "7 días",
  30: "1 mes",
  90: "3 meses",
  365: "1 año"
} as const;

export const timeRangeSchema = z
  .number()
  .refine((val) => val === 7 || val === 30 || val === 90 || val === 365, {
    error: "Time range must be one of: 7, 30, 90, 365"
  });

// Generic time range input schema for any query that needs time filtering
export const timeRangeInputSchema = z.object({
  timeRange: timeRangeSchema.default(DEFAULT_TIME_RANGE)
});

export type TimeRangeInput = z.infer<typeof timeRangeInputSchema>;

// Legacy schema for backward compatibility
export const topStationsInputSchema = z.object({
  timeRange: timeRangeSchema.default(DEFAULT_TIME_RANGE)
});

export type TopStationsInput = z.infer<typeof topStationsInputSchema>;
