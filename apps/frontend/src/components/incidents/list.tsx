import { FireTruckIcon, GarageIcon, WarningIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { useIncidentsQuery } from "@/components/incidents/query-options";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { Route } from "@/routes/_incidents/incidentes";

import type { ListIncidentsResponse } from "@/lib/api/types.gen";

type IncidentsListVariant = "default" | "sidebar";

type IncidentsListProps = {
  variant?: IncidentsListVariant;
  onIncidentHoverChange?: (incidentId: number | null) => void;
};

function formatIncidentsCount(count: number): string {
  const label = count === 1 ? "incidente" : "incidentes";
  return `${count.toLocaleString("es-CR")} ${label}`;
}

function getSectionClassName(variant: IncidentsListVariant) {
  if (variant === "sidebar") {
    return "h-full";
  }

  return "mx-auto w-full max-w-6xl px-6 pb-28 xl:px-0";
}

function getGridClassName(variant: IncidentsListVariant) {
  if (variant === "sidebar") {
    return "grid grid-cols-1 gap-3 2xl:grid-cols-2";
  }

  return "grid grid-cols-1 gap-4 md:grid-cols-2";
}

export function IncidentsList({ variant = "default", onIncidentHoverChange }: IncidentsListProps) {
  const search = Route.useSearch();
  const { data, isPending, isError } = useIncidentsQuery(search);
  const incidents = data?.data ?? [];

  if (isPending) {
    return <IncidentsListSkeleton variant={variant} />;
  }

  if (isError) {
    return <IncidentsListError variant={variant} />;
  }

  if (incidents.length === 0) {
    return <IncidentsListEmpty variant={variant} />;
  }

  return (
    <section className={getSectionClassName(variant)}>
      <div className={variant === "sidebar" ? "mb-3" : "mb-5"}>
        <h2 className={variant === "sidebar" ? "text-lg font-semibold" : "text-2xl font-semibold"}>
          Resultados de la búsqueda
        </h2>
        <p className="text-sm text-muted-foreground">{formatIncidentsCount(incidents.length)}</p>
      </div>

      <IncidentsGrid
        incidents={incidents}
        variant={variant}
        onIncidentHoverChange={onIncidentHoverChange}
      />
    </section>
  );
}

function IncidentsGrid({
  incidents,
  variant,
  onIncidentHoverChange
}: {
  incidents: ListIncidentsResponse["data"];
  variant: IncidentsListVariant;
  onIncidentHoverChange?: (incidentId: number | null) => void;
}) {
  return (
    <div className={getGridClassName(variant)}>
      {incidents.map((incident) => (
        <IncidentListCard
          key={incident.id}
          incident={incident}
          onIncidentHoverChange={onIncidentHoverChange}
        />
      ))}
    </div>
  );
}

function IncidentListCard({
  incident,
  onIncidentHoverChange
}: {
  incident: ListIncidentsResponse["data"][number];
  onIncidentHoverChange?: (incidentId: number | null) => void;
}) {
  const handleIncidentHoverStart = () => {
    if (!onIncidentHoverChange) {
      return;
    }

    onIncidentHoverChange(incident.id);
  };

  return (
    <Link
      to="/incidentes/$slug"
      params={{ slug: incident.slug }}
      onMouseEnter={handleIncidentHoverStart}
      onMouseLeave={() => onIncidentHoverChange?.(null)}
      onFocus={handleIncidentHoverStart}
      onBlur={() => onIncidentHoverChange?.(null)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {incident.dispatchType?.imageUrl && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={incident.dispatchType.imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 scale-110 object-cover opacity-15 blur-2xl transition-transform duration-500 group-hover:scale-125"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="relative flex flex-1 gap-3 p-3">
        {incident.dispatchType?.imageUrl && (
          <div className="flex shrink-0 items-center justify-center">
            <div className="relative size-16 overflow-hidden rounded-lg bg-muted/50">
              <img
                src={incident.dispatchType.imageUrl}
                alt="Ilustración del tipo de incidente"
                className="size-full object-contain p-1.5 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm leading-tight font-medium">{incident.title}</h3>
            <span
              className={
                incident.isOpen
                  ? "shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                  : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
              }>
              {incident.isOpen ? "Abierto" : "Cerrado"}
            </span>
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {incident.address || "Sin ubicación"}
          </p>
          <span className="text-xs font-medium text-muted-foreground">
            {incident.responsibleStationName ?? "Sin estación responsable"}
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-border/50 bg-muted/30 px-3 py-2 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1">
            <GarageIcon className="size-4" />
            <span className="font-medium">{incident.dispatchedStationsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <FireTruckIcon className="size-4" />
            <span className="font-medium">{incident.dispatchedVehiclesCount}</span>
          </div>
        </div>
        <span className="text-muted-foreground first-letter:uppercase">
          {formatRelativeTime(incident.incidentTimestamp)}
        </span>
      </div>
    </Link>
  );
}

function IncidentsListSkeleton({ variant }: { variant: IncidentsListVariant }) {
  const cards = variant === "sidebar" ? 12 : 8;

  return (
    <section className={getSectionClassName(variant)}>
      <div className={getGridClassName(variant)}>
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex gap-3 p-3">
              <Skeleton className="size-16 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col justify-center gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-3 py-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IncidentsListEmpty({ variant }: { variant: IncidentsListVariant }) {
  return (
    <section className={getSectionClassName(variant)}>
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 text-center">
        <p className="text-base font-medium">No se encontraron incidentes</p>
        <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda.</p>
      </div>
    </section>
  );
}

function IncidentsListError({ variant }: { variant: IncidentsListVariant }) {
  return (
    <section className={getSectionClassName(variant)}>
      <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 text-center text-muted-foreground">
        <WarningIcon className="size-6" />
        <p className="text-sm">Ocurrió un error cargando los incidentes.</p>
      </div>
    </section>
  );
}
