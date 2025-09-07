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

export const IncidentSettings = () => {
  const { incidentTimeRange, setIncidentTimeRange } = useMapSettings();

  return (
    <div className="space-y-2">
      <Label htmlFor="incident-time-range" className="font-medium text-sm">
        Mostrar incidentes de las últimas
      </Label>
      <Select value={incidentTimeRange} onValueChange={setIncidentTimeRange}>
        <SelectTrigger id="incident-time-range" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="24h">24 horas</SelectItem>
          <SelectItem value="48h">48 horas</SelectItem>
          <SelectItem value="disabled">Desactivado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
