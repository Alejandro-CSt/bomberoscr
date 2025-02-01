"use client";

import { Badge } from "@/features/components/ui/badge";
import { Button } from "@/features/components/ui/button";
import { ScrollArea } from "@/features/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/components/ui/tabs";
import { useStationIncidents } from "@/features/hooks/use-incidents";
import { useMediaQuery } from "@/features/hooks/use-media-query";
import type { Station } from "@/features/hooks/use-stations";
import { StationKeyDisplay } from "@/features/map/components/station-key-display";
import { useStationInfo } from "@/features/map/context/station-drawer-context";
import { cn, getRelativeTime, isUndefinedDate } from "@/lib/utils";
import { AlertTriangle, Clock, MapPin, XIcon } from "lucide-react";
import { Azeret_Mono as Geist_Mono } from "next/font/google";
import { useEffect } from "react";
import { Drawer } from "vaul";

const geist = Geist_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function StationInfoDrawer() {
  const { station, isDrawerOpen, setIsDrawerOpen } = useStationInfo();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (isDrawerOpen)
      window.requestAnimationFrame(() => {
        document.body.style.pointerEvents = "auto";
      });
  }, [isDrawerOpen]);

  if (!station) return null;

  if (isDesktop)
    return (
      <Drawer.Root
        modal={false}
        direction="left"
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      >
        <Drawer.Portal>
          <Drawer.Content
            className="fixed bottom-2 left-2 z-10 flex h-full max-h-[calc(100vh-16px)] w-[410px] outline-none"
            style={{ "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties}
          >
            <DrawerBody station={station} setIsDrawerOpen={setIsDrawerOpen} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
}

const DrawerBody = ({
  station,
  setIsDrawerOpen
}: { station: Station; setIsDrawerOpen: (isOpen: boolean) => void }) => {
  const incidents = useStationIncidents(station.id);

  return (
    <div className="flex h-full w-full grow flex-col rounded-[16px] bg-background p-5">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <StationKeyDisplay stationKey={station.stationKey || "0-0"} />
          <div>
            <Drawer.Title className="font-bold text-2xl">{station.name}</Drawer.Title>
          </div>
        </div>
        <Button
          onClick={() => setIsDrawerOpen(false)}
          variant="ghost"
          size="icon"
          className="shrink-0"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Cerrar</span>
        </Button>
      </div>

      <Tabs defaultValue="statistics" className="flex-grow">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="information">Información</TabsTrigger>
        </TabsList>
        <TabsContent value="statistics" className="mt-4">
          <StatisticsTab station={station} />
        </TabsContent>
        <TabsContent value="incidents" className="mt-4">
          <IncidentsTab incidents={incidents} />
        </TabsContent>
        <TabsContent value="information" className="mt-4">
          <InformationTab station={station} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const StatisticsTab = ({ station }: { station: Station }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Estadísticas de la Estación</h3>
      <p>Contenido de estadísticas aquí...</p>
    </div>
  );
};

const IncidentsTab = ({ incidents }: { incidents: ReturnType<typeof useStationIncidents> }) => {
  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className={cn("space-y-4 pr-4", geist.className)}>
        {incidents.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">Sin incidentes atendidos.</p>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.incident.id}
              className="rounded-lg border p-4 shadow-sm transition-all hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <Badge variant={incident.incident.isOpen ? "destructive" : "secondary"}>
                  {incident.incident.isOpen ? "Abierto" : "Cerrado"}
                </Badge>
                {isUndefinedDate(incident.incident.incidentTimestamp) ? (
                  <p className="text-muted-foreground text-xs">Fecha no disponible</p>
                ) : (
                  <p className="flex items-center text-muted-foreground text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    {getRelativeTime(incident.incident.incidentTimestamp)}
                  </p>
                )}
              </div>
              <p className="mt-1 flex items-start text-muted-foreground text-xs">
                <MapPin className="mr-1 h-3 w-3 shrink-0 translate-y-0.5" />
                {incident.incident.address || "Dirección no disponible"}
              </p>
              {incident.incident.importantDetails && (
                <p className="mt-2 flex items-start text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3 shrink-0 translate-y-0.5 text-yellow-500" />
                  {incident.incident.importantDetails}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

const InformationTab = ({ station }: { station: Station }) => {
  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <h3 className="mb-1 font-semibold text-sm">Nombre</h3>
          <p className="text-muted-foreground text-xs">{station.name || "No disponible"}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-sm">Clave</h3>
          <p className="text-muted-foreground text-xs">{station.stationKey || "No disponible"}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-sm">Canal de Radio</h3>
          <p className="text-muted-foreground text-xs">{station.radioChannel || "No disponible"}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-sm">Latitud</h3>
          <p className="text-muted-foreground text-xs">{station.latitude || "No disponible"}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-sm">Longitud</h3>
          <p className="text-muted-foreground text-xs">{station.longitude || "No disponible"}</p>
        </div>
        <div className="col-span-2">
          <h3 className="mb-1 font-semibold text-sm">Dirección</h3>
          <p className="text-muted-foreground text-xs">{station.address || "No disponible"}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-sm">Teléfono</h3>
          <p className="text-muted-foreground text-xs">{station.phoneNumber || "No disponible"}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-sm">Fax</h3>
          <p className="text-muted-foreground text-xs">{station.fax || "No disponible"}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-sm">Email</h3>
          <p className="text-muted-foreground text-xs">{station.email || "No disponible"}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-sm">Estado Operativo</h3>
          <p className="text-muted-foreground text-xs">
            {station.isOperative ? "Operativa" : "No Operativa"}
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};
