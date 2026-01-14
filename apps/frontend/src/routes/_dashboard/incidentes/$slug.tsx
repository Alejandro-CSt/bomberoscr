import { createFileRoute, notFound } from "@tanstack/react-router";

import {
  DispatchedStations,
  DispatchedStationsSkeleton
} from "@/components/incidents/dispatched-stations";
import { IncidentArticle, IncidentArticleSkeleton } from "@/components/incidents/incident-article";
import {
  IncidentTimeline,
  IncidentTimelineSkeleton
} from "@/components/incidents/incident-timeline";
import OpenIncidentBanner from "@/components/incidents/open-incident-banner";
import {
  VehicleResponseTimes,
  VehicleResponseTimesSkeleton
} from "@/components/incidents/vehicle-response-times";
import { getIncidentsById } from "@/lib/api";
import { client } from "@/lib/api/client.gen";

export const Route = createFileRoute("/_dashboard/incidentes/$slug")({
  ssr: true,
  loader: async ({ params }) => {
    const { slug } = params;

    const isServer = typeof window === "undefined";
    const baseUrl = isServer
      ? process.env.SERVER_INTERNAL_URL
      : import.meta.env.DEV
        ? "http://localhost:9998/bomberos/hono"
        : "/bomberos/hono";

    client.setConfig({ baseUrl });

    const incidentId = extractIncidentIdFromSlug(slug);

    const { data } = await getIncidentsById({
      path: {
        id: incidentId
      }
    });

    if (!data?.incident) {
      throw notFound();
    }

    return {
      incident: data.incident,
      statistics: data.statistics
    };
  },
  head: ({ params }) => {
    const title = `Incidente ${params.slug} — Emergencias CR`;
    const description = `Detalles del incidente ${params.slug} atendido por Bomberos de Costa Rica.`;
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
  pendingComponent: IncidentDetailSkeleton,
  component: IncidenteDetailPage
});

function IncidentDetailSkeleton() {
  return (
    <article className="grid w-full max-w-none grid-cols-1 gap-6 pt-8 pb-24 md:gap-8 lg:grid-cols-3 lg:items-start">
      <div className="order-1 lg:order-1 lg:col-span-2">
        <IncidentArticleSkeleton />
        <VehicleResponseTimesSkeleton />
        <DispatchedStationsSkeleton />
      </div>
      <aside className="order-2 lg:sticky lg:top-16 lg:order-2 lg:col-span-1">
        <IncidentTimelineSkeleton />
      </aside>
    </article>
  );
}

function IncidenteDetailPage() {
  const { incident } = Route.useLoaderData();

  return (
    <div className="typography grid w-full max-w-none grid-cols-1 gap-6 pt-8 pb-24 md:gap-8 lg:grid-cols-3 lg:items-start">
      {incident.isOpen && (
        <OpenIncidentBanner
          modifiedAt={incident.modifiedAt ?? ""}
          className="not-typography col-span-full"
        />
      )}
      <div className="order-1 flex flex-col gap-4 md:gap-6 lg:order-1 lg:col-span-2">
        <IncidentArticle />
        <VehicleResponseTimes />
        <DispatchedStations />
      </div>
      <aside
        className="not-typography order-2 lg:sticky lg:top-16 lg:order-2 lg:col-span-1"
        aria-label="Cronología del incidente">
        <IncidentTimeline />
      </aside>
    </div>
  );
}

function extractIncidentIdFromSlug(slug: string) {
  const id = Number.parseInt(slug.split("-")[0] ?? "", 10);
  if (Number.isNaN(id)) {
    throw new Error(`Invalid incident slug: ${slug}`);
  }
  return id;
}
