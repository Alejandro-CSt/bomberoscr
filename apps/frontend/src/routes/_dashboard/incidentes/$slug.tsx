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
import { areCoordinatesValid, buildIncidentUrl } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/incidentes/$slug")({
  ssr: true,
  loader: async ({ params }) => {
    const { slug } = params;

    const isServer = typeof window === "undefined";
    const baseUrl = isServer
      ? process.env.SERVER_INTERNAL_URL
      : import.meta.env.VITE_SERVER_URL || "/bomberos/hono";

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
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { incident } = loaderData;

    const formattedDate = new Date(incident.incidentTimestamp).toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const description = `Incidente reportado el ${formattedDate}${incident.location ? ` en ${incident.location}` : ""}. EE-${incident.EEConsecutive}. ${incident.dispatchedStationsCount} estación(es) y ${incident.dispatchedVehiclesCount} unidad(es) despachadas.`;

    const titleWithLocation = incident.title;
    const siteUrl = "https://emergencias.cr";

    const canonicalUrl = buildIncidentUrl(
      incident.id,
      incident.title,
      new Date(incident.incidentTimestamp)
    );

    const fullUrl = `${siteUrl}${canonicalUrl}`;
    const ogImageUrl = `${fullUrl}/og`;

    return {
      meta: [
        { title: `${titleWithLocation} | EE-${incident.EEConsecutive}` },
        { name: "description", content: description },
        { property: "og:title", content: titleWithLocation },
        { property: "og:description", content: description },
        { property: "og:url", content: fullUrl },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: titleWithLocation },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImageUrl }
      ],
      links: [{ rel: "canonical", href: fullUrl }]
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: incident.title,
    description: `Incidente reportado el ${new Date(incident.incidentTimestamp).toLocaleDateString("es-CR", { day: "2-digit", month: "long", year: "numeric" })} en ${incident.location}. EE-${incident.EEConsecutive}. ${incident.dispatchedStationsCount} estación(es) y ${incident.dispatchedVehiclesCount} unidad(es) despachadas.`,
    startDate: incident.incidentTimestamp,
    eventStatus: incident.isOpen
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventCancelled",
    endDate: incident.isOpen ? incident.modifiedAt : undefined,
    location: {
      "@type": "Place",
      name: incident.location,
      ...(incident.address && {
        address: {
          "@type": "PostalAddress",
          streetAddress: incident.address,
          addressCountry: "CR"
        }
      }),
      ...(areCoordinatesValid(incident.latitude, incident.longitude) && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: Number(incident.latitude),
          longitude: Number(incident.longitude)
        }
      })
    },
    organizer: {
      "@type": "EmergencyService",
      name: "Emergencias CR"
    },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode"
  };

  return (
    <div className="typography grid w-full max-w-none grid-cols-1 gap-6 pt-8 pb-24 md:gap-8 lg:grid-cols-3 lg:items-start">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
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
