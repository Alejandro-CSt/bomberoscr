"use client";

import TimeRangeSelect from "@/features/homepage/components/time-range-select";
import useTimeRangeQueryState from "@/features/homepage/hooks/useTimeRangeQueryState";
import { trpc } from "@/lib/trpc/client";
import { cn, getRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/shared/components/ui/skeleton";
import Link from "next/link";

export function FeaturedIncidents() {
  const { timeRange, setTimeRange } = useTimeRangeQueryState();
  const { data, isLoading, isError } = trpc.featuredIncidents.getFeaturedIncidents.useQuery({
    timeRange,
    limit: 5
  });

  return (
    <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
      <div className="flex items-center justify-between gap-4 border-b p-2 font-medium text-size-3">
        <div className="flex items-center gap-4 text-xs">
          <h2 className="mr-auto font-semibold text-sm">Incidentes destacados</h2>
          <div className="*:not-first:mt-2">
            <TimeRangeSelect value={timeRange} onValueChange={setTimeRange} />
          </div>
        </div>
        {/* <Link className="group flex items-center gap-2 text-xs" href="/incidentes/destacados">
          Ver todos
          <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
        </Link> */}
      </div>
      <div className="relative">
        <ul>
          {isLoading || isError
            ? Array.from({ length: 5 }).map((_, index) => (
                <li
                  key={`${index}-${Date.now()}`}
                  className={cn("group", index !== 4 && "border-b")}
                >
                  <div className="grid h-12 grid-cols-[100px_minmax(120px,1fr)_70px] items-center gap-1 p-2 transition-colors duration-200 group-hover:bg-foreground/10">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-full w-full" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-18" />
                    </div>
                  </div>
                </li>
              ))
            : data
                ?.sort((a, b) => b.id - a.id)
                .map((incident, index) => (
                  <li
                    key={incident.id}
                    className={cn("group", index !== data.length - 1 && "border-b")}
                  >
                    <Link href={`/incidentes/${incident.id}`}>
                      <div className="grid h-12 grid-cols-[110px_minmax(100px,1fr)_100px] gap-1 p-2 transition-colors duration-200 group-hover:bg-foreground/10">
                        <div className="flex flex-col text-xs">
                          <p className="overflow-hidden overflow-ellipsis font-semibold text-muted-foreground">
                            {incident.districtName || "UBIC. PENDIENTE"}
                          </p>
                          <p>{getRelativeTime(incident.incidentTimestamp)}</p>
                        </div>
                        <h3 className="line-clamp-2 text-wrap font-medium text-xs">
                          {incident.importantDetails}
                        </h3>
                        <div className="ms-auto flex flex-col *:text-xs">
                          <p className="font-semibold">
                            {incident.dispatchedStationsCount} estaciones
                          </p>
                          <p className="font-semibold">
                            {incident.dispatchedVehiclesCount} vehículos
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
        </ul>

        {isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
              <p className="font-semibold text-destructive text-sm">Error al cargar</p>
              <p className="mt-1 text-muted-foreground text-xs">
                No se pudieron cargar los incidentes destacados
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
