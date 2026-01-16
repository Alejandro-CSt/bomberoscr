import {
  StationHighlightedCard,
  StationHighlightedCardSkeleton
} from "@/components/stations/station-highlighted-card";

interface StationHighlightedIncidentsProps {
  incidents: Array<{
    id: number;
    incidentTimestamp: string;
    details: string | null;
    latitude: string;
    longitude: string;
    dispatchedVehiclesCount: number;
    dispatchedStationsCount: number;
  }>;
}

export function StationHighlightedIncidents({ incidents }: StationHighlightedIncidentsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Destacados</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {incidents.map((incident) => (
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
