import { ErrorPanel } from "@/features/map/layout/components/error-panel";
import { FloatingPanelHeader } from "@/features/map/layout/components/floating-panel-header";
import { Button } from "@/features/shared/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/features/shared/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/features/shared/components/ui/table";
import {
  buildIncidentUrl,
  cn,
  getRelativeTime,
  isUndefinedDate
} from "@/features/shared/lib/utils";
import { getDetailedIncidentById } from "@bomberoscr/db/queries/incidents";
import {
  ArrowElbowDownRightIcon,
  CaretUpDownIcon,
  FireTruckIcon
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

export async function generateMetadata({
  params
}: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const idSchema = z.coerce.number().int().positive();
  const idResult = idSchema.safeParse((await params).id);

  if (!idResult.success) {
    return {
      title: "Incidente no encontrado",
      description: "No se pudo encontrar el incidente especificado."
    };
  }

  const incident = await getDetailedIncidentById(idResult.data);

  if (!incident) {
    return {
      title: "Incidente no encontrado",
      description: "No se pudo encontrar el incidente especificado."
    };
  }

  // Determine location: if detailed data is available, use it.
  // Otherwise, use the reported address with a note.
  let location: string;
  if (incident.province && incident.canton && incident.district) {
    location = `${incident.district.name}, ${incident.canton.name}, ${incident.province.name}`;
  } else if (incident.address) {
    location = `${incident.address} (ubicación en proceso de confirmación)`;
  } else {
    location = "Ubicación pendiente de confirmación";
  }

  const formattedDate = new Date(incident.incidentTimestamp.toString()).toLocaleDateString(
    "es-CR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );

  const incidentType =
    incident.specificDispatchIncidentType?.name ||
    incident.dispatchIncidentType?.name ||
    "Incidente";

  const titleContent =
    incident.specificDispatchIncidentType?.name || incident.importantDetails || incidentType;

  let titleWithLocation = titleContent;
  if (incident.district && incident.canton) {
    titleWithLocation = `${titleContent} en ${incident.district.name}, ${incident.canton.name}`;
  } else {
    titleWithLocation = `${titleContent} (ubicación pendiente)`;
  }

  return {
    title: `${titleContent} | EE-${incident.EEConsecutive}`,
    description: `Incidente reportado el ${formattedDate} en ${location}. ${incident.dispatchedStations.length} estacion(es) y ${incident.dispatchedVehicles.length} unidad(es) despachadas.`,
    openGraph: {
      title: `${titleWithLocation}`,
      description: `Incidente EE-${incident.EEConsecutive} reportado el ${formattedDate} en ${location}.`,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleWithLocation}`,
      description: `Incidente EE-${incident.EEConsecutive} reportado el ${formattedDate} en ${location}.`
    }
  };
}

async function getIncident(id: number) {
  "use cache";
  cacheLife({ revalidate: 60 * 2, expire: 60 * 2 });
  return await getDetailedIncidentById(Number(id));
}

export default async function DetailedIncidentPanel({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const idSchema = z.coerce.number().int().positive();
  const idResult = idSchema.safeParse((await params).id);

  if (!idResult.success) {
    return (
      <ErrorPanel
        title="Detalles del incidente"
        message="ID de incidente inválido"
        backHref="/mapa"
      />
    );
  }

  const incident = await getIncident(idResult.data);

  if (!incident) {
    notFound();
  }

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
    <div className="mx-auto flex h-full max-w-6xl flex-col overflow-y-auto">
      <FloatingPanelHeader title="Detalles del incidente" />
      <div className="flex flex-col gap-4 p-4">
        <section className="flex justify-between">
          <div className="flex flex-col">
            <p className="font-semibold text-muted-foreground">Aviso</p>
            <p className="text-sm">{formatDateTime(incident.incidentTimestamp.toString())}</p>
          </div>
          <div className="flex flex-col text-end">
            <p className="font-semibold text-muted-foreground">Última actualización</p>
            <p className="text-sm first-letter:uppercase">
              {incident.modifiedAt ? getRelativeTime(incident.modifiedAt.toString()) : "N/A"}
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
                  <ArrowElbowDownRightIcon />
                  <p>{incident.specificDispatchIncidentType?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-muted-foreground">Bomberos reportan</p>
              <div className="flex flex-col gap-0.5 text-xs tracking-wider">
                <p>{incident.dispatchIncidentType?.name}</p>
                <div className="inline-flex items-center gap-0.5">
                  <ArrowElbowDownRightIcon />
                  <p>{incident.specificDispatchIncidentType?.name}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="font-semibold text-sm">{incident.importantDetails}</p>
        </section>

        <section>
          <Button
            render={
              <Link
                href={
                  buildIncidentUrl(
                    incident.id,
                    incident.importantDetails ||
                      incident.specificDispatchIncidentType?.name ||
                      incident.dispatchIncidentType?.name ||
                      "Incidente",
                    incident.incidentTimestamp
                  ) as `/incidentes/${string}`
                }
              />
            }
            className="w-full"
          >
            Ver detalles
          </Button>
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
                    <FireTruckIcon className="size-6" weight="fill" />
                    {vehicle.vehicle?.internalNumber}
                  </span>
                  <span className="text-muted-foreground text-sm leading-none">
                    {vehicle.station.name}
                  </span>
                </span>
                <CaretUpDownIcon />
              </CollapsibleTrigger>
              <CollapsibleContent className="rounded-b-md border-x border-b px-4 py-4">
                {!isUndefinedDate(vehicle.dispatchedTime) && (
                  <DispatchedVehicleTimelineEvent
                    isLast={isUndefinedDate(vehicle.arrivalTime)}
                    type="Despacho"
                    value={formatDateTime(vehicle.dispatchedTime.toString())}
                  />
                )}
                {!isUndefinedDate(vehicle.arrivalTime) && (
                  <DispatchedVehicleTimelineEvent
                    isLast={isUndefinedDate(vehicle.departureTime)}
                    type="Llegada a incidente"
                    value={formatDateTime(vehicle.arrivalTime.toString())}
                  />
                )}
                {!isUndefinedDate(vehicle.departureTime) && (
                  <DispatchedVehicleTimelineEvent
                    isLast={isUndefinedDate(vehicle.baseReturnTime)}
                    type="Retiro"
                    value={formatDateTime(vehicle.departureTime.toString())}
                  />
                )}
                {!isUndefinedDate(vehicle.baseReturnTime) && (
                  <DispatchedVehicleTimelineEvent
                    isLast={true}
                    type="Llegada a base"
                    value={formatDateTime(vehicle.baseReturnTime.toString())}
                  />
                )}
                <div className="flex flex-col">
                  <p className="text-muted-foreground text-sm">Tiempo de respuesta</p>
                  <p className="font-semibold text-sm">
                    {isUndefinedDate(vehicle.dispatchedTime) || isUndefinedDate(vehicle.arrivalTime)
                      ? "No disponible"
                      : calculateResponseTime(
                          vehicle.dispatchedTime.toString(),
                          vehicle.arrivalTime.toString()
                        )}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </section>
      </div>
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
