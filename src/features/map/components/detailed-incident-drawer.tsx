"use client";

import { Button } from "@/features/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/features/components/ui/collapsible";
import { Separator } from "@/features/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/features/components/ui/table";
import { useMediaQuery } from "@/features/hooks/use-media-query";
import {
  IncidentDrawerFooter,
  IncidentDrawerHeader,
  createHeaderProps
} from "@/features/map/components/incident-drawer";
import { ResponsiveDrawer } from "@/features/map/components/responsive-drawer";
import { useActiveIncident } from "@/features/map/hooks/use-active-incident";
import { trpc } from "@/lib/trpc/client";
import { cn, getRelativeTime, isUndefinedDate } from "@/lib/utils";
import type { IncidentDetails } from "@/server/trpc";
import { ArrowRight, ChevronsUpDownIcon, LoaderIcon, SirenIcon } from "lucide-react";
import { Geist_Mono } from "next/font/google";

const geist = Geist_Mono({ weight: "variable", subsets: ["latin"] });

export function DetailedIncidentDrawer() {
  const [activeIncident, setActiveIncident] = useActiveIncident();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data: incident, isPending } = trpc.incidents.getIncidentDetailsById.useQuery({
    id: activeIncident.incidentId || undefined
  });

  const handleClose = () => {
    setActiveIncident(null);
  };

  return (
    <ResponsiveDrawer
      fullscreen={true}
      onClose={handleClose}
      isOpen={Number.isInteger(activeIncident.incidentId) && activeIncident.fullScreen}
    >
      <IncidentDrawerHeader
        {...createHeaderProps(isPending, incident?.id, incident?.EEConsecutive, incident?.isOpen)}
      />
      <Separator orientation="horizontal" />
      {isPending || !incident ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <LoaderIcon className="size-4 animate-spin" />
        </div>
      ) : (
        <DetailedView incident={incident} />
      )}
      <Separator orientation="horizontal" />
      <IncidentDrawerFooter hideDetailsButton={isDesktop} />
    </ResponsiveDrawer>
  );
}

const DetailedView = ({ incident }: { incident: IncidentDetails }) => {
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
    <div className={cn("h-full flex-1 overflow-y-auto", geist.className)}>
      <section className="grid grid-cols-2 border-b">
        <span className="flex flex-col border-r p-2 text-muted-foreground text-xs">
          Aviso
          <span className="font-semibold text-foreground">
            {formatDateTime(incident?.incidentTimestamp)}
          </span>
        </span>
        <span className="flex flex-col p-2 text-muted-foreground text-xs">
          Última actualización
          <span className="font-semibold text-foreground first-letter:uppercase">
            {incident?.modifiedAt ? getRelativeTime(incident?.modifiedAt) : "N/A"}
          </span>
        </span>
      </section>
      <p className="text-pretty p-2 font-semibold text-sm leading-relaxed">{incident?.address}</p>
      <Separator />
      <section className="grid grid-cols-2 border-b text-muted-foreground text-xs">
        <span className="flex flex-col border-r p-2">
          Se despacha por
          <span className="flex flex-col font-semibold text-foreground">
            {incident?.dispatchIncidentType ? incident.dispatchIncidentType.name : "N/A"}
            {incident?.specificDispatchIncidentType && incident.dispatchIncidentType && (
              <span className="inline-flex gap-1">
                <ArrowRight className="size-4 text-muted-foreground/75" />
                {incident.specificDispatchIncidentType.name}
              </span>
            )}
          </span>
        </span>
        <span className="flex flex-col p-2">
          Bomberos reportan
          <span className="flex flex-col font-semibold text-foreground">
            {incident?.incidentType ? incident.incidentType.name : "N/A"}
            {incident?.incidentType && incident.specificIncidentType && (
              <span className="inline-flex gap-1">
                <ArrowRight className="size-4 text-muted-foreground/75" />
                {incident.specificIncidentType.name}
              </span>
            )}
          </span>
        </span>
        <span className="col-span-full flex flex-col border-t p-2">
          Detalles
          <span className="font-semibold text-foreground">{incident?.importantDetails}</span>
        </span>
      </section>
      <section className="font-medium">
        <h4 className="p-2 font-semibold">Estaciones</h4>
        <Table className="text-sm">
          <TableBody>
            {incident?.dispatchedStations.map((station) => (
              <TableRow key={station.id} className="border-none">
                <TableCell className="w-2/3 px-2 py-1">
                  {station.station.name} {station.attentionOnFoot && " (A PIE)"}
                </TableCell>
                <TableCell className="w-1/3 px-2 py-1">
                  {station.serviceTypeId === 0 ? "APOYO" : "RESPONSABLE"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <Separator />
      <section className="mb-1 flex flex-col">
        <h4 className="p-2 font-semibold">Unidades</h4>
        {incident?.dispatchedVehicles.map((vehicle) => (
          <Collapsible key={vehicle.id} className="mx-4 mt-2 border-x border-t">
            <div className="flex-1">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex flex-col">
                  <p className="text-muted-foreground text-sm">{vehicle.station.name}</p>
                  <p className="flex items-center gap-1 font-bold">
                    <SirenIcon className="size-4 min-w-4" />
                    {vehicle.attentionOnFoot ? "Atención a pie" : vehicle.vehicle?.internalNumber}
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-9 p-0">
                    <ChevronsUpDownIcon className="size-4" />
                    <span className="sr-only">Mostrar u ocultar más</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-4 border-b px-4">
                {!isUndefinedDate(vehicle.dispatchedTime) && (
                  <DispatchedVehicleTimelineEvent
                    isLast={isUndefinedDate(vehicle.arrivalTime)}
                    type="Despacho"
                    value={formatDateTime(vehicle.dispatchedTime)}
                  />
                )}
                {!isUndefinedDate(vehicle.arrivalTime) && (
                  <DispatchedVehicleTimelineEvent
                    isLast={isUndefinedDate(vehicle.departureTime)}
                    type="Llegada a incidente"
                    value={formatDateTime(vehicle.arrivalTime)}
                  />
                )}
                {!isUndefinedDate(vehicle.departureTime) && (
                  <DispatchedVehicleTimelineEvent
                    isLast={isUndefinedDate(vehicle.baseReturnTime)}
                    type="Retiro"
                    value={formatDateTime(vehicle.departureTime)}
                  />
                )}
                {!isUndefinedDate(vehicle.baseReturnTime) && (
                  <DispatchedVehicleTimelineEvent
                    isLast={true}
                    type="Llegada a base"
                    value={formatDateTime(vehicle.baseReturnTime)}
                  />
                )}
                <div className="flex flex-col">
                  <p className="text-muted-foreground text-sm">Tiempo de respuesta</p>
                  <p className="font-semibold">
                    {isUndefinedDate(vehicle.dispatchedTime) || isUndefinedDate(vehicle.arrivalTime)
                      ? "N/A"
                      : calculateResponseTime(vehicle.dispatchedTime, vehicle.arrivalTime)}
                  </p>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </section>
    </div>
  );
};

const DispatchedVehicleTimelineEvent = ({
  type,
  value,
  isLast
}: {
  type: string;
  value: string;
  isLast: boolean;
}) => {
  return (
    <div className="relative flex items-baseline gap-4 pb-2">
      <div
        className={cn(
          !isLast &&
            "overflow-hidden before:absolute before:left-[5px] before:h-full before:w-[2px] before:bg-foreground"
        )}
      >
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          className="bi bi-circle-fill fill-foreground"
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
