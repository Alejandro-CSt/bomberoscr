import {
  StationIncidentCard,
  StationIncidentCardSkeleton
} from "@/components/stations/station-incident-card";

interface StationRecentIncidentsProps {
  incidents: Array<{
    id: number;
    incidentTimestamp: string;
    importantDetails: string | null;
    address: string | null;
    latitude: string;
    longitude: string;
    dispatchedVehiclesCount: number;
    dispatchedStationsCount: number;
  }>;
}

export function StationRecentIncidents({ incidents }: StationRecentIncidentsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Incidentes recientes</h2>
      {incidents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay incidentes recientes para esta estación.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {incidents.map((incident) => (
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
