import { useSuspenseQuery } from "@tanstack/react-query";

import {
  StationIncidentCard,
  StationIncidentCardSkeleton
} from "@/components/stations/station-incident-card";
import { getStationsByKeyRecentIncidentsOptions } from "@/lib/api/@tanstack/react-query.gen";
import { Route } from "@/routes/_dashboard/estaciones/$name";

export function StationRecentIncidents() {
  const { station } = Route.useLoaderData();
  const { data } = useSuspenseQuery(
    getStationsByKeyRecentIncidentsOptions({
      path: { key: station.stationKey }
    })
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Incidentes recientes</h2>
      {data.incidents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay incidentes recientes para esta estación.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.incidents.map((incident) => (
            <StationIncidentCard
              key={incident.id}
              incident={incident}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function StationRecentIncidentsSkeleton({ count = 5 }: { count?: number }) {
  const keys = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <section className="flex flex-col gap-4">
      <div className="h-7 w-40 animate-pulse rounded bg-muted" />
      <div className="flex flex-col gap-2">
        {keys.map((key) => (
          <StationIncidentCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}
