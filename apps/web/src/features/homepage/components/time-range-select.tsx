"use client";

import useTimeRangeQueryState from "@/features/homepage/hooks/useTimeRangeQueryState";
import {
  ALLOWED_TIME_RANGE_VALUES,
  TIME_RANGE_LABELS
} from "@/features/homepage/schemas/timeRange";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/components/ui/select";

export default function TimeRangeSelect() {
  const { timeRange, setTimeRange } = useTimeRangeQueryState();
  return (
    <Select
      defaultValue={timeRange.toString()}
      value={timeRange.toString()}
      onValueChange={(val) => setTimeRange(Number(val))}
    >
      <SelectTrigger className="h-6 border-none p-0 px-2 text-xs focus-visible:ring-0">
        <SelectValue placeholder="Rango de tiempo" />
      </SelectTrigger>
      <SelectContent className="text-xs">
        {ALLOWED_TIME_RANGE_VALUES.map((timeRange) => (
          <SelectItem key={timeRange} value={timeRange.toString()}>
            {TIME_RANGE_LABELS[timeRange]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
