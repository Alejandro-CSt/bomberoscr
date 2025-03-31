"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/features/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/features/components/ui/table";
import { useDynamicPanel } from "@/features/map/hooks/use-dynamic-panel";
import { trpc } from "@/lib/trpc/client";
import { cn, getRelativeTime, isUndefinedDate } from "@/lib/utils";
import { ArrowElbowDownRight, CaretUpDown, FireTruck } from "@phosphor-icons/react";

export function DetailedIncidentPanel() {
  const [panelState] = useDynamicPanel();
  const { incidentId } = panelState;

  const { data: incident, isPending } = trpc.incidents.getIncidentDetailsById.useQuery({
    id: incidentId || undefined
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

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">No hay información disponible</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4")}>
      <section className="flex justify-between">
        <div className="flex flex-col">
          <p className="font-semibold text-muted-foreground">Aviso</p>
          <p className="text-sm">{formatDateTime(incident.incidentTimestamp)}</p>
        </div>
        <div className="flex flex-col text-end">
          <p className="font-semibold text-muted-foreground">Última acutalización</p>
          <p className="text-sm first-letter:uppercase">
            {incident.modifiedAt ? getRelativeTime(incident.modifiedAt) : "N/A"}
          </p>
        </div>
      </section>

      <section>
        <p className="text-muted-foreground text-sm leading-relaxed tracking-wide">
          {incident.address}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col">
            <p className="font-semibold text-muted-foreground">Se despacha por</p>
            <div className="flex flex-col gap-0.5 text-xs tracking-wider">
              <p>{incident.dispatchIncidentType?.name}</p>
              <div className="inline-flex items-center gap-0.5">
                <ArrowElbowDownRight />
                <p>{incident.specificDispatchIncidentType?.name}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-muted-foreground">Bomberos reportan</p>
            <div className="flex flex-col gap-0.5 text-xs tracking-wider">
              <p>{incident.dispatchIncidentType?.name}</p>
              <div className="inline-flex items-center gap-0.5">
                <ArrowElbowDownRight />
                <p>{incident.specificDispatchIncidentType?.name}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="font-semibold text-sm">{incident.importantDetails}</p>
      </section>

      <section className="flex flex-col gap-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border-r">Estación</TableHead>
              <TableHead>Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incident.dispatchedStations.map((station) => (
              <TableRow key={station.id}>
                <TableCell
                  className={cn("border-r", station.serviceTypeId === 1 && "font-semibold")}
                >
                  {station.station.name}
                </TableCell>
                <TableCell className={cn(station.serviceTypeId === 1 && "font-semibold")}>
                  {station.serviceTypeId === 1 ? "RESPONSABLE" : "APOYO"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-2 pb-4">
        <h4 className="font-semibold text-muted-foreground">Unidades</h4>
        {incident.dispatchedVehicles.map((vehicle) => (
          <Collapsible key={vehicle.id} defaultOpen={incident.dispatchedVehicles.length <= 2}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-2 data-[state=open]:rounded-b-none">
              <span className="flex flex-col items-start gap-1">
                <span className="flex items-center gap-4">
                  <FireTruck className="size-6" weight="fill" />
                  {vehicle.vehicle?.internalNumber}
                </span>
                <span className="text-muted-foreground text-sm leading-none">
                  {vehicle.station.name}
                </span>
              </span>
              <CaretUpDown />
            </CollapsibleTrigger>
            <CollapsibleContent className="rounded-b-md border-x border-b px-4 py-4">
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
                <p className="font-semibold text-sm">
                  {isUndefinedDate(vehicle.dispatchedTime) || isUndefinedDate(vehicle.arrivalTime)
                    ? "N/A"
                    : calculateResponseTime(vehicle.dispatchedTime, vehicle.arrivalTime)}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </section>
    </div>
  );
}

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
