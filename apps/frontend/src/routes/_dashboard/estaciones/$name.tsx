import { createFileRoute, notFound } from "@tanstack/react-router";
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
import { getStationsByNameByName } from "@/lib/api";
import { client } from "@/lib/api/client.gen";

export const Route = createFileRoute("/_dashboard/estaciones/$name")({
  ssr: true,
  loader: async ({ params }) => {
    const { name } = params;
    const decodedName = decodeURIComponent(name);

    const isServer = typeof window === "undefined";
    const baseUrl = isServer
      ? process.env.SERVER_INTERNAL_URL
      : import.meta.env.VITE_SERVER_URL || "/bomberos/hono";

    client.setConfig({ baseUrl });

    const { data } = await getStationsByNameByName({
      path: {
        name: decodedName
      }
    });

    if (!data?.station) {
      throw notFound();
    }

    return {
      station: data.station
    };
  },
  head: ({ loaderData, params }) => {
    const stationName =
      loaderData?.station?.name ?? decodeURIComponent(params.name).replace(/-/g, " ");
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
  component: EstacionDetailPage,
  pendingComponent: PageSkeleton
});

function EstacionDetailPage() {
  const { station } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        <aside className="top-[calc(var(--app-top-offset)+2rem)] self-start md:sticky">
          <StationProfileHeader station={station} />
        </aside>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Suspense fallback={<StationHighlightedIncidentsSkeleton />}>
            <StationHighlightedIncidents />
          </Suspense>
          <Suspense fallback={<StationHeatmapSectionSkeleton />}>
            <StationHeatmapSection />
          </Suspense>
          <Suspense fallback={<StationRecentIncidentsSkeleton />}>
            <StationRecentIncidents />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<StationCollaborationsSkeleton />}>
        <StationCollaborations />
      </Suspense>
      <Suspense fallback={<StationVehiclesSkeleton />}>
        <StationVehicles />
      </Suspense>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
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
