import {
  type StationPageParams,
  findStationByName
} from "@/app/(max-w-6xl)/(subheader)/estaciones/[name]/page";
import { buildIncidentUrl } from "@/features/shared/lib/utils";
import {
  StationHighlightedCard,
  StationHighlightedCardSkeleton,
  type StationIncident
} from "@/features/stations/components/station-highlighted-card";
import { getStationHighlightedIncidents } from "@bomberoscr/db/queries/stations/highlightedIncidents";
import { DEFAULT_TIME_RANGE } from "@bomberoscr/lib/time-range";
import type { Route } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

export function StationHighlightedIncidentsSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Destacados</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <StationHighlightedCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}

export async function StationHighlightedIncidents({ params }: { params: StationPageParams }) {
  "use cache";
  cacheLife({ revalidate: 60 * 30, expire: 60 * 30 });

  const { name } = await params;
  const { station } = await findStationByName(name);

  if (!station) {
    notFound();
  }

  const incidents = await getStationHighlightedIncidents({
    stationId: station.id,
    timeRange: DEFAULT_TIME_RANGE,
    limit: 6
  });

  const minimalIncidents: StationIncident[] = incidents.map((incident) => {
    const details = incident.details || "Incidente";
    return {
      id: incident.id,
      url: buildIncidentUrl(incident.id, details, new Date(incident.incidentTimestamp)) as Route,
      details,
      dispatchedStationsCount: incident.dispatchedStationsCount,
      dispatchedVehiclesCount: incident.dispatchedVehiclesCount,
      incidentTimestamp: incident.incidentTimestamp.toISOString(),
      latitude: incident.latitude,
      longitude: incident.longitude
    };
  });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Destacados</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {minimalIncidents.map((incident) => (
          <StationHighlightedCard key={incident.url} incident={incident} />
        ))}
      </div>
    </section>
  );
}
