"use client";

import { FloatingPanelHeader } from "@/features/map/layout/components/floating-panel-header";
import {
  type IncidentTimeRange,
  type ShowStations,
  useMapSettings
} from "@/features/map/layout/context/map-settings-context";
import { Label } from "@/features/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/shared/components/ui/select";
import { cn } from "@/features/shared/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
interface StationsSettingsProps {
  showStations: ShowStations;
  setShowStations: (value: ShowStations) => void;
}

interface IncidentSettingsProps {
  incidentTimeRange: IncidentTimeRange;
  setIncidentTimeRange: (value: IncidentTimeRange) => void;
}

export default function MapSettings() {
  const { theme, setTheme } = useTheme();
  const { showStations, setShowStations, incidentTimeRange, setIncidentTimeRange } =
    useMapSettings();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <FloatingPanelHeader title="Ajustes" />
      <div className="flex flex-col gap-2 p-2">
        <div>
          <Label className="font-medium text-sm">Estilo del mapa</Label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-lg p-2 transition-all",
                theme === "light" ? "ring-2 ring-primary" : "hover:bg-muted"
              )}
              onClick={() => {
                setTheme("light");
              }}
            >
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src="/light-map.png"
                  alt="Vista clara del mapa"
                  width={160}
                  height={112}
                  quality={95}
                  className="h-28 w-full object-cover"
                />
              </div>
              <span className="font-medium text-foreground text-xs">Claro</span>
            </button>
            <button
              type="button"
              className={cn(
                "gtransition-all flex flex-1 flex-col items-center gap-2 rounded-lg p-2",
                theme === "dark" ? "ring-2 ring-primary" : "hover:bg-muted"
              )}
              onClick={() => {
                setTheme("dark");
              }}
            >
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src="/dark-map.png"
                  alt="Vista oscura del mapa"
                  width={160}
                  height={112}
                  className="h-28 w-full object-cover"
                />
              </div>
              <span className="font-medium text-foreground text-xs">Oscuro</span>
            </button>
          </div>
        </div>
        <IncidentSettings
          incidentTimeRange={incidentTimeRange}
          setIncidentTimeRange={setIncidentTimeRange}
        />
        <StationsSettings showStations={showStations} setShowStations={setShowStations} />
      </div>
    </div>
  );
}

const StationsSettings = ({ showStations, setShowStations }: StationsSettingsProps) => {
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

const IncidentSettings = ({ incidentTimeRange, setIncidentTimeRange }: IncidentSettingsProps) => {
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
