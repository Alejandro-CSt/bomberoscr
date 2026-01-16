import { useSuspenseQuery } from "@tanstack/react-query";

import {
  StationHighlightedCard,
  StationHighlightedCardSkeleton
} from "@/components/stations/station-highlighted-card";
import { getStationsByKeyHighlightedIncidentsOptions } from "@/lib/api/@tanstack/react-query.gen";
import { Route } from "@/routes/_dashboard/estaciones/$name";

export function StationHighlightedIncidents() {
  const { station } = Route.useLoaderData();
  const { data } = useSuspenseQuery(
    getStationsByKeyHighlightedIncidentsOptions({
      path: { key: station.stationKey }
    })
  );

  if (data.incidents.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Destacados</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.incidents.map((incident) => (
          <StationHighlightedCard
            key={incident.id}
            incident={incident}
          />
        ))}
      </div>
    </section>
  );
}

export function StationHighlightedIncidentsSkeleton({ count = 6 }: { count?: number }) {
  const keys = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <section className="flex flex-col gap-4">
      <div className="h-7 w-32 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {keys.map((key) => (
          <StationHighlightedCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}
