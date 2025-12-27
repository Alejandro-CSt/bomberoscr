import {
  type BaseIncidentCard,
  IncidentCard,
  IncidentCardSkeleton
} from "@/features/shared/components/incident-card";
import { buildIncidentUrl, cn } from "@/features/shared/lib/utils";
import { getLatestIncidents } from "@bomberoscr/db/queries/homepage/latestIncidents";
import { ArrowRightIcon } from "lucide-react";
import type { Route } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

async function LatestIncidentsList() {
  "use cache";
  cacheLife("homepage");

  const incidents = await getLatestIncidents({ limit: 6 });

  const cards: BaseIncidentCard[] = incidents.map((incident) => ({
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
  }));

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      {cards.map((incident) => (
        <IncidentCard key={incident.url} incident={incident} />
      ))}
    </div>
  );
}

function LatestIncidentsListSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      {[1, 2, 3, 4, 5, 6].map((key) => (
        <IncidentCardSkeleton key={key} />
      ))}
    </div>
  );
}

export function LatestIncidents() {
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

      <Suspense fallback={<LatestIncidentsListSkeleton />}>
        <LatestIncidentsList />
      </Suspense>
    </section>
  );
}
