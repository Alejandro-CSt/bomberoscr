import { useSuspenseQuery } from "@tanstack/react-query";

import {
  StationDetailsIncidentCard,
  StationDetailsIncidentCardSkeleton
} from "@/components/stations/station-details-incident-card";
import { listIncidentsOptions } from "@/lib/api/@tanstack/react-query.gen";
import { Route } from "@/routes/_dashboard/estaciones/$name";

export function StationDetailsRecentIncidents() {
  const { station } = Route.useLoaderData();
  const { data } = useSuspenseQuery(
    listIncidentsOptions({
      query: {
        stations: [station.id],
        // sort: ["incidentTimestamp", "desc"], // desc id sorting works better
        pageSize: 5
      }
    })
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Incidentes recientes</h2>
      {data.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay incidentes recientes para esta estación.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((incident) => (
            <StationDetailsIncidentCard
              key={incident.id}
              incident={{
                id: incident.id,
                incidentTimestamp: incident.incidentTimestamp,
                importantDetails: incident.importantDetails,
                address: incident.address,
                mapImageUrl: incident.mapImageUrl,
                dispatchedVehiclesCount: incident.dispatchedVehiclesCount,
                dispatchedStationsCount: incident.dispatchedStationsCount
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function StationDetailsRecentIncidentsSkeleton({ count = 5 }: { count?: number }) {
  const keys = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <section className="flex flex-col gap-4">
      <div className="h-7 w-40 animate-pulse rounded bg-muted" />
      <div className="flex flex-col gap-2">
        {keys.map((key) => (
          <StationDetailsIncidentCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}
