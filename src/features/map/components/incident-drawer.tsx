"use client";

import { Badge } from "@/features/components/ui/badge";
import { Button } from "@/features/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/features/components/ui/collapsible";
import { ScrollArea } from "@/features/components/ui/scroll-area";
import { ResponsiveDrawer } from "@/features/map/components/responsive-drawer";
import { useIncidentInfo } from "@/features/map/context/incident-drawer-context";
import { trpc } from "@/lib/trpc/client";
import { cn, isUndefinedDate } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Building2,
  ChevronsUpDownIcon,
  MapPinIcon,
  SirenIcon,
  TimerIcon,
  XIcon
} from "lucide-react";
import { Geist_Mono } from "next/font/google";
import { Drawer } from "vaul";

const geist = Geist_Mono({ weight: "variable", subsets: ["latin"] });

export default function IncidentInfoDrawer() {
  const { incidentId, isDrawerOpen, setIsDrawerOpen } = useIncidentInfo();
  const { data: incident, isPending } = trpc.getIncidentById.useQuery({
    id: incidentId
  });

  const formatDateTime = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("es-CR", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const calculateResponseTime = (dispatch: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(dispatch).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <ResponsiveDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen}>
      <Drawer.Close className="absolute top-4 right-4">
        <XIcon className="size-4" />
      </Drawer.Close>
      <DialogTitle className="sr-only">Detalles del incidente</DialogTitle>
      <div className="flex h-full flex-col" style={geist.style}>
        <div className="border-b px-4 py-3 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-muted-foreground text-sm">Incidente</p>
              <h3 className="font-semibold text-lg">EE {incident?.EEConsecutive}</h3>
            </div>
            <Badge
              variant={incident?.isOpen ? "destructive" : "secondary"}
              className="rounded-full px-3"
            >
              #{incident?.id}
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-grow pb-4">
          {isPending ? (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-muted-foreground">Cargando incidente...</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <div className="space-y-4 rounded-lg p-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Hora de aviso</p>
                    <div className="mt-1 flex items-center gap-2">
                      <TimerIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{formatDateTime(incident?.incidentTimestamp)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Ubicación</p>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="mt-0.5 h-4 min-h-4 w-4 min-w-4 text-muted-foreground" />
                    <p className="font-medium leading-tight">{incident?.address}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Estación responsable</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{incident?.station?.name}</p>
                  </div>
                </div>

                {incident?.importantDetails && (
                  <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <p className="flex-1 text-yellow-700 leading-tight">
                      {incident.importantDetails}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="font-semibold">Unidades</h4>
                {incident?.dispatchedVehicles?.map((dispatch) => (
                  <Collapsible key={dispatch.id} className="rounded-lg border-2 border-primary p-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-muted-foreground text-sm">{dispatch.station.name}</p>
                          <p className="flex items-center gap-1 font-bold">
                            <SirenIcon className="size-4 min-w-4" />
                            {dispatch.attentionOnFoot
                              ? "Atención a pie"
                              : dispatch.vehicle?.internalNumber}
                          </p>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-9 p-0">
                            <ChevronsUpDownIcon className="size-4" />
                            <span className="sr-only">Mostrar u ocultar más</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="mt-4">
                        {!isUndefinedDate(dispatch.dispatchedTime) && (
                          <DispatchedVehicleTimelineEvent
                            isLast={isUndefinedDate(dispatch.arrivalTime)}
                            type="Despacho"
                            value={formatDateTime(dispatch.dispatchedTime)}
                          />
                        )}
                        {!isUndefinedDate(dispatch.arrivalTime) && (
                          <DispatchedVehicleTimelineEvent
                            isLast={isUndefinedDate(dispatch.departureTime)}
                            type="Llegada a incidente"
                            value={formatDateTime(dispatch.arrivalTime)}
                          />
                        )}
                        {!isUndefinedDate(dispatch.departureTime) && (
                          <DispatchedVehicleTimelineEvent
                            isLast={isUndefinedDate(dispatch.baseReturnTime)}
                            type="Retiro"
                            value={formatDateTime(dispatch.departureTime)}
                          />
                        )}
                        {!isUndefinedDate(dispatch.baseReturnTime) && (
                          <DispatchedVehicleTimelineEvent
                            isLast={true}
                            type="Llegada a base"
                            value={formatDateTime(dispatch.baseReturnTime)}
                          />
                        )}
                        <div className="flex flex-col">
                          <p className="text-muted-foreground text-sm">Tiempo de respuesta</p>
                          <p className="font-semibold">
                            {isUndefinedDate(dispatch.dispatchedTime) ||
                            isUndefinedDate(dispatch.arrivalTime)
                              ? "N/A"
                              : calculateResponseTime(
                                  dispatch.dispatchedTime,
                                  dispatch.arrivalTime
                                )}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </ResponsiveDrawer>
  );
}

const DispatchedVehicleTimelineEvent = ({
  type,
  value,
  isLast
}: { type: string; value: string; isLast: boolean }) => {
  return (
    <div className="relative flex items-baseline gap-4 pb-2">
      <div
        className={cn(
          !isLast &&
            "before:absolute before:left-[5px] before:h-full before:w-[2px] before:bg-primary"
        )}
      >
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          className="bi bi-circle-fill fill-primary"
          viewBox="0 0 16 16"
        >
          <circle cx="8" cy="8" r="8" />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm">{type}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
};
