"use client";

import type { LatestIncident } from "@/features/dashboard/homepage/api/homepageRouter";
import {
  type BaseIncidentCard,
  IncidentCard,
  IncidentCardSkeleton
} from "@/features/shared/components/incident-card";
import { buildIncidentUrl, cn } from "@/features/shared/lib/utils";
import { trpc } from "@/features/trpc/client";
import { ArrowRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

type SerializedLatestIncident = Omit<LatestIncident, "incidentTimestamp"> & {
  incidentTimestamp: string;
};

function mapToIncidentCard(incident: SerializedLatestIncident): BaseIncidentCard {
  return {
    url: buildIncidentUrl(
      incident.id,
      incident.importantDetails || "Incidente",
      new Date(incident.incidentTimestamp)
    ) as Route,
    details: incident.importantDetails || "Incidente",
    address: incident.address || "Ubicación pendiente",
    dispatchedStationsCount: incident.dispatchedStationsCount ?? 0,
    dispatchedVehiclesCount: incident.dispatchedVehiclesCount ?? 0,
    responsibleStation: incident.responsibleStation || "Estación pendiente",
    incidentTimestamp: new Date(incident.incidentTimestamp).toISOString()
  };
}

export function LatestIncidents() {
  const {
    data: incidents,
    isLoading,
    isError
  } = trpc.homepage.getLatestIncidents.useQuery({
    limit: 6
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-xl lg:text-2xl">Recientes</h2>
        <Link
          className={cn(
            "flex items-center gap-1",
            "font-medium text-muted-foreground text-sm hover:text-foreground",
            "group"
          )}
          href="/incidentes"
        >
          Ver todos
          <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {isError ? (
        <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-sm">
          <p className="font-semibold text-destructive">Error al cargar</p>
          <p className="text-muted-foreground">No se pudieron cargar los incidentes recientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          {isLoading || !incidents
            ? ["one", "two", "three", "four", "five", "six"].map((key) => (
                <IncidentCardSkeleton key={key} />
              ))
            : incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={mapToIncidentCard(incident)} />
              ))}
        </div>
      )}
    </section>
  );
}
