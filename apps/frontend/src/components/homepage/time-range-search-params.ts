import { createStandardSchemaV1, parseAsNumberLiteral } from "nuqs";

export const ALLOWED_TIME_RANGE_VALUES = [7, 30, 90, 365] as const;
export const DEFAULT_TIME_RANGE = 30;

export const TIME_RANGE_LABELS = {
  7: "7 días",
  30: "1 mes",
  90: "3 meses",
  365: "1 año"
} as const;

export const timeRangeParser =
  parseAsNumberLiteral(ALLOWED_TIME_RANGE_VALUES).withDefault(DEFAULT_TIME_RANGE);

export const timeRangeSearchParams = {
  timeRange: timeRangeParser
};

export const timeRangeSearchSchema = createStandardSchemaV1(timeRangeSearchParams, {
  partialOutput: true
});
