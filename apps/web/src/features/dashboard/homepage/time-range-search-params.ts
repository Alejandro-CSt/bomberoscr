import { ALLOWED_TIME_RANGE_VALUES, DEFAULT_TIME_RANGE } from "@bomberoscr/lib/time-range";
import { createLoader, parseAsInteger } from "nuqs/server";

// Search params descriptor - reusable for loader and client hooks
export const timeRangeSearchParams = {
  timeRange: parseAsInteger.withDefault(DEFAULT_TIME_RANGE)
};

// Server-side loader for the homepage time range filter
export const loadTimeRangeSearchParams = createLoader(timeRangeSearchParams);

// Helper to validate the time range value
export function getValidTimeRange(timeRange: number): number {
  return (ALLOWED_TIME_RANGE_VALUES as number[]).includes(timeRange)
    ? timeRange
    : DEFAULT_TIME_RANGE;
}
