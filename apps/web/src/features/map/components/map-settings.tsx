"use client";

import { Button } from "@/features/components/ui/button";
import { Label } from "@/features/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/components/ui/select";
import { Separator } from "@/features/components/ui/separator";
import { FloatingPanelHeader } from "@/features/layout/components/floating-panel-header";
import {
  type IncidentTimeRange,
  type ShowStations,
  useMapSettings
} from "@/features/map/context/map-settings-context";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

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
      <div className="flex flex-col gap-2 p-4">
        <div>
          <Label className="font-medium text-sm">Estilo del mapa</Label>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="flex-1 justify-center"
              onClick={() => {
                setTheme("light");
              }}
            >
              <SunIcon className="mr-2 h-4 w-4" />
              Claro
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="flex-1 justify-center"
              onClick={() => {
                setTheme("dark");
              }}
            >
              <MoonIcon className="mr-2 h-4 w-4" />
              Oscuro
            </Button>
          </div>
        </div>
        <Separator />
        <IncidentSettings
          incidentTimeRange={incidentTimeRange}
          setIncidentTimeRange={setIncidentTimeRange}
        />
        <Separator />
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
