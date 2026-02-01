import { GarageIcon, FireTruckIcon, WarningIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { listIncidentsOptions } from "@/lib/api/@tanstack/react-query.gen";
import { formatRelativeTime } from "@/lib/utils";

import type { ListIncidentsResponses } from "@/lib/api/types.gen";

function LatestIncidentCard({
  incident
}: {
  incident: ListIncidentsResponses["200"]["data"][number];
}) {
  return (
    <Link
      to="/incidentes/$slug"
      params={{ slug: incident.slug }}
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

      {/* Content */}
      <div className="relative flex flex-1 gap-3 p-3">
        {/* Foreground illustration */}
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

        {/* Text content */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <h3 className="line-clamp-1 text-sm leading-tight font-medium">{incident.title}SS</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">{incident.address}</p>
          <span className="text-xs font-medium text-muted-foreground">
            {incident.responsibleStationName}
          </span>
        </div>
      </div>

      {/* Footer stats */}
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

function LatestIncidentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex gap-3 p-3">
        <Skeleton className="size-16 shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-3 py-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function LatestIncidents() {
  const latestOptions = listIncidentsOptions({
    query: {
      pageSize: 6,
      sort: ["id", "desc"]
    }
  });

  const { data, isLoading, isError } = useQuery({
    ...latestOptions,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });

  const latestIncidents = data?.data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold lg:text-2xl">Recientes</h2>
        <Link
          to="/incidentes"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          Ver todos
          <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="relative overflow-hidden">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          {isLoading || isError
            ? isError
              ? [1, 2, 3, 4, 5, 6].map((key) => (
                  <div
                    key={key}
                    className={key > 1 ? "hidden md:block" : undefined}>
                    <LatestIncidentCardSkeleton />
                  </div>
                ))
              : [1, 2, 3, 4, 5, 6].map((key) => <LatestIncidentCardSkeleton key={key} />)
            : latestIncidents.map((incident) => (
                <LatestIncidentCard
                  key={incident.id}
                  incident={incident}
                />
              ))}
        </div>
        {isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 p-4 text-center text-sm text-muted-foreground backdrop-blur-sm">
            <WarningIcon className="size-6" />
            Ocurrió un error cargando los últimos incidentes
          </div>
        ) : null}
      </div>
    </section>
  );
}
