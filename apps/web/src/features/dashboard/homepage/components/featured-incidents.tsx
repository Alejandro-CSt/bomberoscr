"use client";

import { FeaturedIncidentsHeader } from "@/features/dashboard/homepage/components/featured-incidents-header";
import { IncidentListItem } from "@/features/dashboard/homepage/components/incident-list-item";
import useTimeRangeQueryState from "@/features/dashboard/homepage/hooks/useTimeRangeQueryState";
import { trpc } from "@/lib/trpc/client";

export function FeaturedIncidents() {
  const { timeRange } = useTimeRangeQueryState();
  const { data, isLoading, isError } = trpc.featuredIncidents.getFeaturedIncidents.useQuery({
    timeRange,
    limit: 5
  });

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
        <FeaturedIncidentsHeader />
        <div className="relative">
          <ul>
            {Array.from({ length: 5 }, (_, index) => ({
              id: `loading-${index}`,
              index
            })).map(({ id, index }) => (
              <IncidentListItem
                key={id}
                isLoading={true}
                isLast={index === 4}
                isOdd={index % 2 === 1}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (isError) {
    return (
      <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
        <FeaturedIncidentsHeader />
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
              <p className="font-semibold text-destructive text-sm">Error al cargar</p>
              <p className="mt-1 text-muted-foreground text-xs">
                No se pudieron cargar los incidentes destacados
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render with data
  const sortedIncidents = data?.sort((a, b) => b.id - a.id) || [];

  return (
    <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
      <FeaturedIncidentsHeader />
      <div className="relative">
        <ul>
          {sortedIncidents.map((incident, index) => (
            <IncidentListItem
              key={incident.id}
              incident={incident}
              isLast={index === sortedIncidents.length - 1}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
