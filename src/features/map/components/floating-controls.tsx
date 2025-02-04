"use client";

import { Button } from "@/features/components/ui/button";
import { Label } from "@/features/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/features/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/components/ui/select";
import { Separator } from "@/features/components/ui/separator";
import type { IncidentTimeRange, ShowStations } from "@/features/map/context/map-settings-context";
import { useMapSettings } from "@/features/map/context/map-settings-context";
import {
  CompassIcon,
  MapIcon,
  MoonIcon,
  SunIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon
} from "lucide-react";
import { useState } from "react";
import { useMap } from "react-map-gl/maplibre";

interface StationsSettingsProps {
  showStations: ShowStations;
  setShowStations: (value: ShowStations) => void;
}

interface IncidentSettingsProps {
  incidentTimeRange: IncidentTimeRange;
  setIncidentTimeRange: (value: IncidentTimeRange) => void;
}

export function MapControls() {
  const { current: map } = useMap();

  return (
    <div className="absolute right-4 bottom-12 z-10 hidden md:block">
      <div className="flex flex-col items-center space-y-2 rounded-full bg-white/10 p-2 shadow-lg backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.zoomIn()}
          className="rounded-full hover:bg-white/20"
        >
          <ZoomInIcon className="h-5 w-5" />
          <span className="sr-only">Acercar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.zoomOut()}
          className="rounded-full hover:bg-white/20"
        >
          <ZoomOutIcon className="h-5 w-5" />
          <span className="sr-only">Alejar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.resetNorthPitch()}
          className="rounded-full hover:bg-white/20"
        >
          <CompassIcon className="h-5 w-5" />
          <span className="sr-only">Centrar norte</span>
        </Button>
      </div>
    </div>
  );
}

export function MapSettings() {
  const {
    style,
    setStyle,
    showStations,
    setShowStations,
    incidentTimeRange,
    setIncidentTimeRange
  } = useMapSettings();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 shadow-lg backdrop-blur-sm hover:bg-white/20"
          >
            <MapIcon className="h-5 w-5" />
            <span className="sr-only">Ajustes del mapa</span>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Ajustes</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="font-medium text-sm">Estilo del mapa</Label>
            <div className="flex gap-2">
              <Button
                variant={style === "light" ? "default" : "outline"}
                className="w-full justify-center"
                onClick={() => setStyle("light")}
              >
                <SunIcon className="mr-2 h-4 w-4" />
                Claro
              </Button>
              <Button
                variant={style === "dark" ? "default" : "outline"}
                className="w-full justify-center"
                onClick={() => setStyle("dark")}
              >
                <MoonIcon className="mr-2 h-4 w-4" />
                Oscuro
              </Button>
            </div>
          </div>
          <Separator />
          <StationsSettings showStations={showStations} setShowStations={setShowStations} />
          <Separator />
          <IncidentSettings
            incidentTimeRange={incidentTimeRange}
            setIncidentTimeRange={setIncidentTimeRange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

const StationsSettings = ({ showStations, setShowStations }: StationsSettingsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="show-stations" className="font-medium text-sm">
        Mostrar estaciones
      </Label>
      <Select value={showStations} onValueChange={setShowStations}>
        <SelectTrigger id="show-stations">
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
        <SelectTrigger id="incident-time-range">
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
