import { GarageIcon, FireTruckIcon, WarningIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getIncidentsOptions } from "@/lib/api/@tanstack/react-query.gen";
import { formatRelativeTime } from "@/lib/utils";

interface LatestIncident {
  id: number;
  slug: string;
  details: string;
  address: string;
  dispatchedStationsCount: number;
  dispatchedVehiclesCount: number;
  responsibleStation: string;
  incidentTimestamp: string;
}

function LatestIncidentCard({ incident }: { incident: LatestIncident }) {
  return (
    <Link
      to="/incidentes/$slug"
      params={{ slug: incident.slug }}
      className="flex flex-col gap-2 rounded border border-border bg-card p-4 text-sm">
      <h3 className="line-clamp-1 text-base font-medium">{incident.details}</h3>
      <span className="font-medium">{incident.responsibleStation}</span>
      <p className="line-clamp-1 text-muted-foreground">{incident.address}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <GarageIcon className="size-5" />
            <span>{incident.dispatchedStationsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <FireTruckIcon className="size-5" />
            <span>{incident.dispatchedVehiclesCount}</span>
          </div>
        </div>
        <span className="text-xs whitespace-nowrap text-muted-foreground first-letter:uppercase">
          {formatRelativeTime(incident.incidentTimestamp)}
        </span>
      </div>
    </Link>
  );
}

function LatestIncidentCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded border border-border bg-card p-4 text-sm">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function LatestIncidents() {
  const latestOptions = getIncidentsOptions({
    query: {
      limit: 6,
      sortBy: "id",
      sortOrder: "desc"
    }
  });

  const { data, isLoading, isError } = useQuery({
    ...latestOptions,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  });

  const latestIncidents = data?.view === "default" ? data.incidents : [];

  const cards: LatestIncident[] = latestIncidents.map((incident) => ({
    id: incident.id,
    slug: incident.slug,
    details: incident.importantDetails || "Incidente",
    address: incident.address ?? "Ubicación pendiente",
    dispatchedStationsCount: incident.dispatchedStationsCount ?? 0,
    dispatchedVehiclesCount: incident.dispatchedVehiclesCount ?? 0,
    responsibleStation: incident.responsibleStation ?? "Estación pendiente",
    incidentTimestamp: incident.incidentTimestamp
  }));

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
            : cards.map((incident) => (
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
