import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import {
  StationCollaborations,
  StationCollaborationsSkeleton
} from "@/components/stations/station-collaborations";
import {
  StationHeatmapSection,
  StationHeatmapSectionSkeleton
} from "@/components/stations/station-heatmap-section";
import {
  StationHighlightedIncidents,
  StationHighlightedIncidentsSkeleton
} from "@/components/stations/station-highlighted-incidents";
import {
  StationProfileHeader,
  StationProfileHeaderSkeleton
} from "@/components/stations/station-profile-header";
import {
  StationRecentIncidents,
  StationRecentIncidentsSkeleton
} from "@/components/stations/station-recent-incidents";
import { StationVehicles, StationVehiclesSkeleton } from "@/components/stations/station-vehicles";
import {
  getStationsByKeyCollaborationsOptions,
  getStationsByKeyHeatmapOptions,
  getStationsByKeyHighlightedIncidentsOptions,
  getStationsByKeyRecentIncidentsOptions,
  getStationsByKeyVehiclesOptions,
  getStationsByNameByNameOptions
} from "@/lib/api/@tanstack/react-query.gen";

export const Route = createFileRoute("/_dashboard/estaciones/$name")({
  head: ({ params }) => {
    const stationName = decodeURIComponent(params.name).replace(/-/g, " ");
    const title = `Estación ${stationName} — Emergencias CR`;
    const description = `Detalles y estadísticas de incidentes atendidos por la estación de ${stationName}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description }
      ]
    };
  },
  component: EstacionDetailPage
});

function EstacionDetailPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StationContent />
    </Suspense>
  );
}

function StationContent() {
  const { name } = Route.useParams();
  const decodedName = decodeURIComponent(name);

  const { data: stationData } = useSuspenseQuery(
    getStationsByNameByNameOptions({
      path: { name: decodedName }
    })
  );

  if (!stationData.station) {
    return <StationNotFound name={decodedName} />;
  }

  const station = stationData.station;
  const stationKey = station.stationKey;

  return (
    <div className="flex flex-col gap-6 pt-12">
      <div className="grid w-full grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        <aside className="top-[calc(var(--app-top-offset)+2rem)] self-start md:sticky">
          <StationProfileHeader station={station} />
        </aside>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Suspense fallback={<StationHighlightedIncidentsSkeleton />}>
            <HighlightedIncidentsSection stationKey={stationKey} />
          </Suspense>
          <Suspense fallback={<StationHeatmapSectionSkeleton />}>
            <HeatmapSection stationKey={stationKey} />
          </Suspense>
          <Suspense fallback={<StationRecentIncidentsSkeleton />}>
            <RecentIncidentsSection stationKey={stationKey} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<StationCollaborationsSkeleton />}>
        <CollaborationsSection stationKey={stationKey} />
      </Suspense>
      <Suspense fallback={<StationVehiclesSkeleton />}>
        <VehiclesSection stationKey={stationKey} />
      </Suspense>
    </div>
  );
}

function HighlightedIncidentsSection({ stationKey }: { stationKey: string }) {
  const { data } = useSuspenseQuery(
    getStationsByKeyHighlightedIncidentsOptions({
      path: { key: stationKey }
    })
  );

  if (data.incidents.length === 0) {
    return null;
  }

  return <StationHighlightedIncidents incidents={data.incidents} />;
}

function HeatmapSection({ stationKey }: { stationKey: string }) {
  const { data } = useSuspenseQuery(
    getStationsByKeyHeatmapOptions({
      path: { key: stationKey }
    })
  );

  return (
    <StationHeatmapSection
      data={data.data}
      totalIncidents={data.totalIncidents}
    />
  );
}

function RecentIncidentsSection({ stationKey }: { stationKey: string }) {
  const { data } = useSuspenseQuery(
    getStationsByKeyRecentIncidentsOptions({
      path: { key: stationKey }
    })
  );

  return <StationRecentIncidents incidents={data.incidents} />;
}

function CollaborationsSection({ stationKey }: { stationKey: string }) {
  const { data } = useSuspenseQuery(
    getStationsByKeyCollaborationsOptions({
      path: { key: stationKey }
    })
  );

  return <StationCollaborations collaborations={data.collaborations} />;
}

function VehiclesSection({ stationKey }: { stationKey: string }) {
  const { data } = useSuspenseQuery(
    getStationsByKeyVehiclesOptions({
      path: { key: stationKey }
    })
  );

  return <StationVehicles vehicles={data.vehicles} />;
}

function StationNotFound({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <h1 className="text-2xl font-bold">Estación no encontrada</h1>
      <p className="text-muted-foreground">
        No se encontró ninguna estación con el nombre "{name}".
      </p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 pt-12">
      <div className="grid w-full grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        <aside className="top-(--app-top-offset) self-start md:sticky">
          <StationProfileHeaderSkeleton />
        </aside>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <StationHighlightedIncidentsSkeleton />
          <StationHeatmapSectionSkeleton />
          <StationRecentIncidentsSkeleton />
        </div>
      </div>
      <StationCollaborationsSkeleton />
      <StationVehiclesSkeleton />
    </div>
  );
}
