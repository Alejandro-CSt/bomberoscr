import {
  ALLOWED_TIME_RANGE_VALUES,
  DEFAULT_TIME_RANGE
} from "@/features/homepage/schemas/timeRange";
import { createParser, useQueryState } from "nuqs";

const timeRangeParser = createParser({
  parse: (value: string | null) => {
    if (value === null) return null;
    const intValue = Number(value);
    return ALLOWED_TIME_RANGE_VALUES.includes(
      intValue as (typeof ALLOWED_TIME_RANGE_VALUES)[number]
    )
      ? intValue
      : null;
  },
  serialize: (value: number) => value.toString()
});

const useTimeRangeQueryState = () => {
  const [timeRange, setTimeRange] = useQueryState(
    "timeRange",
    timeRangeParser.withDefault(DEFAULT_TIME_RANGE)
  );
  return { timeRange, setTimeRange };
};

export default useTimeRangeQueryState;
