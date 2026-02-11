import { WarningIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { IncidentCard, IncidentCardSkeleton } from "@/components/incidents/card";
import { listIncidentsOptions } from "@/lib/api/@tanstack/react-query.gen";
import { cn } from "@/lib/utils";

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
                    className={cn(key > 1 && "hidden md:block")}>
                    <IncidentCardSkeleton />
                  </div>
                ))
              : [1, 2, 3, 4, 5, 6].map((key) => <IncidentCardSkeleton key={key} />)
            : latestIncidents.map((incident) => (
                <IncidentCard
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
