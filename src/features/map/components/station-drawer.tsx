"use client";

import { Badge } from "@/features/components/ui/badge";
import { ScrollArea } from "@/features/components/ui/scroll-area";
import { Skeleton } from "@/features/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/components/ui/tabs";
import { useStationInfo } from "@/features/map/context/station-drawer-context";
import { trpc } from "@/lib/trpc/client";
import { cn, getRelativeTime, isUndefinedDate } from "@/lib/utils";
import type { StationDetailsWithIncidents } from "@/server/trpc";
import { DialogTitle } from "@radix-ui/react-dialog";
import { AlertTriangle, Clock, MapPin, XIcon } from "lucide-react";
import { Azeret_Mono as Geist_Mono } from "next/font/google";
import { Drawer } from "vaul";
import { ResponsiveDrawer } from "./responsive-drawer";
import { StationKeyDisplay } from "./station-key-display";

const geist = Geist_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function StationInfoDrawer() {
  const { stationId, isDrawerOpen, setIsDrawerOpen } = useStationInfo();

  const { data: station, isPending } = trpc.getStationDetailsWithIncidents.useQuery({
    id: stationId
  });

  return (
    <ResponsiveDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen}>
      {isPending ? (
        <div className="flex flex-col gap-2 px-4">
          <DialogTitle className="sr-only">Cargando</DialogTitle>
          <div className="flex items-center gap-2 py-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-8" /> <Skeleton className="h-8" /> <Skeleton className="h-8" />
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : (
        <>
          <Header station={station} />
          <DrawerBody station={station} />
        </>
      )}
    </ResponsiveDrawer>
  );
}

const Header = ({ station }: { station: StationDetailsWithIncidents }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <StationKeyDisplay stationKey={station?.stationKey || "0-0"} />
        <div>
          <Drawer.Title className="font-bold text-lg">{station?.name}</Drawer.Title>
        </div>
      </div>
      <Drawer.Close>
        <XIcon className="size-4" />
        <span className="sr-only">Cerrar</span>
      </Drawer.Close>
    </div>
  );
};

const DrawerBody = ({
  station
}: {
  station: StationDetailsWithIncidents;
}) => {
  return (
    <Tabs defaultValue="statistics" className="flex min-h-0 flex-col">
      <TabsList className="mx-2">
        <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        <TabsTrigger value="incidents">Incidentes</TabsTrigger>
        <TabsTrigger value="information">Información</TabsTrigger>
      </TabsList>
      <ScrollArea>
        <TabsContent
          value="statistics"
          className="mb-4 h-full flex-col px-4 data-[state=active]:flex"
        >
          <StatisticsTab station={station} />
        </TabsContent>
        <TabsContent value="incidents" className="mb-4 px-4">
          <IncidentsTab station={station} />
        </TabsContent>
        <TabsContent
          value="information"
          className="mb-4 h-full flex-col px-4 data-[state=active]:flex"
        >
          <InformationTab station={station} />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

const StatisticsTab = ({ station: _ }: { station: StationDetailsWithIncidents }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Estadísticas de la Estación</h3>
      <p>Contenido de estadísticas aquí...</p>
    </div>
  );
};

const IncidentsTab = ({ station }: { station: StationDetailsWithIncidents }) => {
  return (
    <div className={cn("space-y-4", geist.className)}>
      {station?.dispatchedStations.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm">Sin incidentes atendidos.</p>
      ) : (
        station?.dispatchedStations.map((dispatchedStation) => (
          <div
            key={dispatchedStation.incident.id}
            className="rounded-lg border p-4 shadow-sm transition-all hover:bg-accent"
          >
            <div className="flex items-center justify-between">
              <Badge variant={dispatchedStation.incident.isOpen ? "destructive" : "secondary"}>
                {dispatchedStation.incident.isOpen ? "Abierto" : "Cerrado"}
              </Badge>
              {isUndefinedDate(dispatchedStation.incident.incidentTimestamp) ? (
                <p className="text-muted-foreground text-xs">Fecha no disponible</p>
              ) : (
                <p className="flex items-center text-muted-foreground text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {getRelativeTime(dispatchedStation.incident.incidentTimestamp)}
                </p>
              )}
            </div>
            <p className="mt-1 flex items-start text-muted-foreground text-xs">
              <MapPin className="mr-1 h-3 w-3 shrink-0 translate-y-0.5" />
              {dispatchedStation.incident.address || "Dirección no disponible"}
            </p>
            {dispatchedStation.incident.importantDetails && (
              <p className="mt-2 flex items-start text-xs">
                <AlertTriangle className="mr-1 h-3 w-3 shrink-0 translate-y-0.5 text-yellow-500" />
                {dispatchedStation.incident.importantDetails}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const InformationTab = ({ station }: { station: StationDetailsWithIncidents }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <h3 className="mb-1 font-semibold text-sm">Nombre</h3>
        <p className="text-muted-foreground text-xs">{station?.name || "No disponible"}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-sm">Clave</h3>
        <p className="text-muted-foreground text-xs">{station?.stationKey || "No disponible"}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-sm">Canal de Radio</h3>
        <p className="text-muted-foreground text-xs">{station?.radioChannel || "No disponible"}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-sm">Latitud</h3>
        <p className="text-muted-foreground text-xs">{station?.latitude || "No disponible"}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-sm">Longitud</h3>
        <p className="text-muted-foreground text-xs">{station?.longitude || "No disponible"}</p>
      </div>
      <div className="col-span-2">
        <h3 className="mb-1 font-semibold text-sm">Dirección</h3>
        <p className="text-muted-foreground text-xs">{station?.address || "No disponible"}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-sm">Teléfono</h3>
        <p className="text-muted-foreground text-xs">{station?.phoneNumber || "No disponible"}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-sm">Fax</h3>
        <p className="text-muted-foreground text-xs">{station?.fax || "No disponible"}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-sm">Email</h3>
        <p className="text-muted-foreground text-xs">{station?.email || "No disponible"}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-sm">Estado Operativo</h3>
        <p className="text-muted-foreground text-xs">
          {station?.isOperative ? "Operativa" : "No Operativa"}
        </p>
      </div>
    </div>
  );
};
