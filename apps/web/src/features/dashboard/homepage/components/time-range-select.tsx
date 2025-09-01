"use client";

import useTimeRangeQueryState from "@/features/dashboard/homepage/hooks/useTimeRangeQueryState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/components/ui/select";
import { ALLOWED_TIME_RANGE_VALUES, TIME_RANGE_LABELS } from "@bomberoscr/lib/time-range";

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
            {TIME_RANGE_LABELS[timeRange as keyof typeof TIME_RANGE_LABELS]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
