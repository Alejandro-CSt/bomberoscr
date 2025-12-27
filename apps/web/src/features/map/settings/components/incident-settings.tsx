"use client";

import { useMapSettings } from "@/features/map/settings/hooks/use-map-settings";
import type { IncidentTimeRange } from "@/features/map/settings/types";
import { Label } from "@/features/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/shared/components/ui/select";

const INCIDENT_TIME_RANGE_OPTIONS: Array<{ label: string; value: IncidentTimeRange }> = [
  { label: "24 horas", value: "24h" },
  { label: "48 horas", value: "48h" },
  { label: "Desactivado", value: "disabled" }
];

type IncidentTimeRangeOption = (typeof INCIDENT_TIME_RANGE_OPTIONS)[number];

export const IncidentSettings = () => {
  const { incidentTimeRange, setIncidentTimeRange } = useMapSettings();
  const selectedRange: IncidentTimeRangeOption | null =
    INCIDENT_TIME_RANGE_OPTIONS.find((option) => option.value === incidentTimeRange) ?? null;

  return (
    <div className="space-y-2">
      <Label htmlFor="incident-time-range" className="font-medium text-sm">
        Mostrar incidentes de las últimas
      </Label>
      <Select
        items={INCIDENT_TIME_RANGE_OPTIONS}
        value={selectedRange}
        onValueChange={(option: IncidentTimeRangeOption | null) => {
          if (!option) return;
          setIncidentTimeRange(option.value);
        }}
      >
        <SelectTrigger id="incident-time-range" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {INCIDENT_TIME_RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
