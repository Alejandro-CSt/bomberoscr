"use client";

import { IncidentListItem } from "@/features/dashboard/homepage/components/incident-list-item";
import { LatestIncidentsHeader } from "@/features/dashboard/homepage/components/latest-incidents-header";
import { trpc } from "@/features/trpc/client";

export function LatestIncidents() {
  const {
    data: incidents,
    isLoading,
    isError
  } = trpc.homepage.getLatestIncidents.useQuery({
    limit: 5
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
        <LatestIncidentsHeader />
        <div className="relative">
          <ul>
            {Array.from({ length: 5 }, (_, index) => ({
              id: `loading-${index}`,
              index
            })).map(({ id, index }) => (
              <IncidentListItem key={id} isLoading={true} isLast={index === 4} />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (isError || !incidents) {
    return (
      <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
        <LatestIncidentsHeader />
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
              <p className="font-semibold text-destructive text-sm">Error al cargar</p>
              <p className="mt-1 text-muted-foreground text-xs">
                No se pudieron cargar los incidentes recientes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden whitespace-nowrap rounded-lg border bg-card shadow-2xl">
      <LatestIncidentsHeader />
      <div className="relative">
        <ul>
          {incidents?.map((incident, index) => (
            <IncidentListItem
              key={incident.id}
              incident={incident}
              isLast={index === incidents.length - 1}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
