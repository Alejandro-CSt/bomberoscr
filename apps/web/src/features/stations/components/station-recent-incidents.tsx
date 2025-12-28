import {
  type StationPageParams,
  findStationByName
} from "@/app/(max-w-6xl)/(subheader)/estaciones/[name]/page";
import { buildIncidentUrl } from "@/features/shared/lib/utils";
import {
  type StationIncident,
  StationIncidentCard,
  StationIncidentCardSkeleton
} from "@/features/stations/components/station-incident-card";
import { getStationRecentIncidents } from "@bomberoscr/db/queries/stations/recentIncidents";
import type { Route } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

export async function StationRecentIncidents({ params }: { params: StationPageParams }) {
  "use cache";
  cacheLife({ revalidate: 60, expire: 60 });
  const { name } = await params;
  const { station } = await findStationByName(name);

  if (!station) {
    notFound();
  }

  const rawIncidents = await getStationRecentIncidents({ stationId: station.id, limit: 5 });

  if (rawIncidents.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No hay incidentes recientes para esta estación.
      </p>
    );
  }

  const incidents: StationIncident[] = rawIncidents.map((incident) => {
    const details = incident.importantDetails || "Incidente";
    return {
      id: incident.id,
      url: buildIncidentUrl(incident.id, details, incident.incidentTimestamp) as Route,
      details,
      address: incident.address ?? "Ubicación pendiente",
      dispatchedStationsCount: incident.dispatchedStationsCount,
      dispatchedVehiclesCount: incident.dispatchedVehiclesCount,
      responsibleStation: incident.responsibleStation ?? "Estación pendiente",
      incidentTimestamp: incident.incidentTimestamp.toISOString(),
      latitude: incident.latitude,
      longitude: incident.longitude
    };
  });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Incidentes recientes</h2>
      <div className="flex flex-col gap-2">
        {incidents.map((incident) => (
          <StationIncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </section>
  );
}

export function StationRecentIncidentsSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Incidentes recientes</h2>
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((key) => (
          <StationIncidentCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}
