"use client";

import { useMapSettings } from "@/features/map/settings/hooks/use-map-settings";
import type { ShowStations } from "@/features/map/settings/types";
import { Label } from "@/features/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/shared/components/ui/select";

const SHOW_STATIONS_OPTIONS: Array<{ label: string; value: ShowStations }> = [
  { label: "Todas", value: "all" },
  { label: "Operativas", value: "operative" },
  { label: "Ninguna", value: "none" }
];

type ShowStationsOption = (typeof SHOW_STATIONS_OPTIONS)[number];

export const StationsSettings = () => {
  const { showStations, setShowStations } = useMapSettings();
  const selectedOption: ShowStationsOption | null =
    SHOW_STATIONS_OPTIONS.find((option) => option.value === showStations) ?? null;

  return (
    <div className="space-y-2">
      <Label htmlFor="show-stations" className="font-medium text-sm">
        Mostrar estaciones
      </Label>
      <Select
        items={SHOW_STATIONS_OPTIONS}
        value={selectedOption}
        onValueChange={(option: ShowStationsOption | null) => {
          if (!option) return;
          setShowStations(option.value);
        }}
      >
        <SelectTrigger id="show-stations" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {SHOW_STATIONS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
