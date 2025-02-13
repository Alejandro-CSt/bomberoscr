"use client";

import { Button } from "@/features/components/ui/button";
import { DrawerClose, DrawerHeader, DrawerTitle } from "@/features/components/ui/drawer";
import { Label } from "@/features/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/components/ui/select";
import { Separator } from "@/features/components/ui/separator";
import { ResponsiveDrawer } from "@/features/map/components/responsive-drawer";
import {
  type IncidentTimeRange,
  type ShowStations,
  useMapSettings
} from "@/features/map/context/map-settings-context";
import { useFloatingMenu } from "@/features/map/hooks/use-floating-menu";
import { MoonIcon, SunIcon, XIcon } from "lucide-react";

interface StationsSettingsProps {
  showStations: ShowStations;
  setShowStations: (value: ShowStations) => void;
}

interface IncidentSettingsProps {
  incidentTimeRange: IncidentTimeRange;
  setIncidentTimeRange: (value: IncidentTimeRange) => void;
}

export function MapSettingsDrawer() {
  const {
    style,
    setStyle,
    showStations,
    setShowStations,
    incidentTimeRange,
    setIncidentTimeRange
  } = useMapSettings();
  const [floatingMenu, setFloatingMenu] = useFloatingMenu();

  return (
    <ResponsiveDrawer
      isOpen={floatingMenu.options}
      onClose={() => setFloatingMenu({ options: false })}
      className="max-h-96"
    >
      <DrawerHeader className="flex items-center justify-between">
        <DrawerTitle className="font-semibold text-lg">Ajustes</DrawerTitle>
        <DrawerClose asChild>
          <Button variant="ghost">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </DrawerClose>
      </DrawerHeader>
      <Separator />
      <div className="flex flex-col gap-2">
        <div className="px-4">
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
    </ResponsiveDrawer>
  );
}

const StationsSettings = ({ showStations, setShowStations }: StationsSettingsProps) => {
  return (
    <div className="px-4">
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
    <div className="space-y-2 px-4">
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
