"use client";

import { useMapSettings } from "@/features/map/settings/hooks/use-map-settings";
import { Label } from "@/features/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/shared/components/ui/select";

export const StationsSettings = () => {
  const { showStations, setShowStations } = useMapSettings();

  return (
    <div className="space-y-2">
      <Label htmlFor="show-stations" className="font-medium text-sm">
        Mostrar estaciones
      </Label>
      <Select value={showStations} onValueChange={setShowStations}>
        <SelectTrigger id="show-stations" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="operative">Operativas</SelectItem>
          <SelectItem value="none">Ninguna</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
