import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";

import {
  StationDetailsCollaborations,
  StationDetailsCollaborationsSkeleton
} from "@/components/stations/station-details-collaborations";
import {
  StationDetailsHeatmapSection,
  StationDetailsHeatmapSectionSkeleton
} from "@/components/stations/station-details-heatmap-section";
import {
  StationDetailsHighlightedIncidents,
  StationDetailsHighlightedIncidentsSkeleton
} from "@/components/stations/station-details-highlighted-incidents";
import {
  StationDetailsProfileHeader,
  StationDetailsProfileHeaderSkeleton
} from "@/components/stations/station-details-profile-header";
import {
  StationDetailsRecentIncidents,
  StationDetailsRecentIncidentsSkeleton
} from "@/components/stations/station-details-recent-incidents";
import {
  StationDetailsVehicles,
  StationDetailsVehiclesSkeleton
} from "@/components/stations/station-details-vehicles";
import { getStationByName } from "@/lib/api";
import { client } from "@/lib/api/client.gen";

export const Route = createFileRoute("/_dashboard/estaciones/$name")({
  ssr: true,
  loader: async ({ params }) => {
    const { name } = params;
    const decodedName = decodeURIComponent(name);

    const isServer = typeof window === "undefined";
    const baseUrl = isServer
      ? process.env.SERVER_INTERNAL_URL
      : import.meta.env.VITE_SERVER_URL || "/bomberos/api";

    client.setConfig({ baseUrl });

    const { data } = await getStationByName({
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
        <aside className="top-[calc(var(--app-top-offset)+2rem)] self-start lg:sticky">
          <StationDetailsProfileHeader station={station} />
        </aside>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Suspense fallback={<StationDetailsHighlightedIncidentsSkeleton />}>
            <StationDetailsHighlightedIncidents />
          </Suspense>
          <Suspense fallback={<StationDetailsHeatmapSectionSkeleton />}>
            <StationDetailsHeatmapSection />
          </Suspense>
          <Suspense fallback={<StationDetailsRecentIncidentsSkeleton />}>
            <StationDetailsRecentIncidents />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<StationDetailsCollaborationsSkeleton />}>
        <StationDetailsCollaborations />
      </Suspense>
      <Suspense fallback={<StationDetailsVehiclesSkeleton />}>
        <StationDetailsVehicles />
      </Suspense>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        <aside className="top-(--app-top-offset) self-start lg:sticky">
          <StationDetailsProfileHeaderSkeleton />
        </aside>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <StationDetailsHighlightedIncidentsSkeleton />
          <StationDetailsHeatmapSectionSkeleton />
          <StationDetailsRecentIncidentsSkeleton />
        </div>
      </div>
      <StationDetailsCollaborationsSkeleton />
      <StationDetailsVehiclesSkeleton />
    </div>
  );
}
