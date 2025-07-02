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

interface TimeRangeSelectProps {
  value: number;
  onValueChange: (value: number) => void;
}

export default function TimeRangeSelect({ value, onValueChange }: TimeRangeSelectProps) {
  return (
    <Select
      defaultValue={value.toString()}
      value={value.toString()}
      onValueChange={(val) => onValueChange(Number(val))}
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
