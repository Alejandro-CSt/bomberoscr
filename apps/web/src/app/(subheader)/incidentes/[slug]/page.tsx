"use cache";

import IncidentNarrative from "@/features/dashboard/incidents/incident-narrative";
import IncidentTimeline from "@/features/dashboard/incidents/incident-timeline";
import IncidentMap from "@/features/dashboard/incidents/map/components/incident-map";
import OpenIncidentBanner from "@/features/dashboard/incidents/open-incident-banner";
import { VehicleResponseTimeChart } from "@/features/dashboard/incidents/vehicle-response-time-chart";
import { VehicleResponseTimeTable } from "@/features/dashboard/incidents/vehicle-response-time-table";
import env from "@/features/lib/env";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/shared/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/features/shared/components/ui/tooltip";
import { buildIncidentUrl, extractIncidentId } from "@/features/shared/lib/utils";
import { type DetailedIncident, getDetailedIncidentById } from "@bomberoscr/db/queries/incidents";
import { areCoordinatesValid } from "@bomberoscr/lib/areCoordinatesValid";
import { BarChartHorizontalIcon, TableIcon, TriangleAlertIcon } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

function getLocation(incident: NonNullable<DetailedIncident>): string | undefined {
  if (incident.province && incident.canton && incident.district) {
    return `${incident.district.name}, ${incident.canton.name}, ${incident.province.name}`;
  }
  return undefined;
}

function getIncidentTitle(incident: NonNullable<DetailedIncident>): string {
  const incidentType =
    incident.importantDetails ||
    incident.specificDispatchIncidentType?.name ||
    incident.dispatchIncidentType?.name ||
    "Incidente";

  let title = incidentType;
  const location = getLocation(incident);
  if (location) {
    title += ` EN ${location}`;
  }
  return title;
}

function getIncidentTitleWithoutLocation(incident: NonNullable<DetailedIncident>): string {
  return (
    incident.importantDetails ||
    incident.specificDispatchIncidentType?.name ||
    incident.dispatchIncidentType?.name ||
    "Incidente"
  );
}

function getJsonLd(incident: NonNullable<DetailedIncident>) {
  const locationName = getLocation(incident);
  const formattedDate = new Date(incident.incidentTimestamp.toString()).toLocaleDateString(
    "es-CR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );
  const description = `Incidente reportado el ${formattedDate} en ${locationName}. EE-${incident.EEConsecutive}. ${incident.dispatchedStations.length} estación(es) y ${incident.dispatchedVehicles.length} unidad(es) despachadas.`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: getIncidentTitle(incident),
    description,
    startDate: incident.incidentTimestamp.toISOString(),
    eventStatus: incident.isOpen
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventCancelled",
    endDate: incident.isOpen ? incident.modifiedAt.toISOString() : undefined,
    location: {
      "@type": "Place",
      name: locationName,
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
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Extract ID from slug (supports both old format /incidentes/123 and new format /incidentes/123-slug-2025-01-01)
  const id = extractIncidentId(`/incidentes/${slug}`);

  if (!id) {
    return {
      title: "Incidente no encontrado",
      description: "No se pudo encontrar el incidente especificado.",
      alternates: {
        canonical: env.SITE_URL ? new URL("/incidentes", env.SITE_URL).toString() : undefined
      }
    };
  }

  const incident = await getDetailedIncidentById(id);

  if (!incident) {
    return {
      title: "Incidente no encontrado",
      description: "No se pudo encontrar el incidente especificado.",
      alternates: {
        canonical: env.SITE_URL ? new URL("/incidentes", env.SITE_URL).toString() : undefined
      }
    };
  }

  const location = getLocation(incident);

  const formattedDate = new Date(incident.incidentTimestamp.toString()).toLocaleDateString(
    "es-CR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );

  const titleWithLocation = getIncidentTitle(incident);

  const description = `Incidente reportado el ${formattedDate}${location ? ` en ${location}` : ""}. EE-${incident.EEConsecutive}. ${incident.dispatchedStations.length} estación(es) y ${incident.dispatchedVehicles.length} unidad(es) despachadas.`;

  const canonicalUrl = buildIncidentUrl(
    incident.id,
    getIncidentTitleWithoutLocation(incident),
    incident.incidentTimestamp
  );

  return {
    title: `${titleWithLocation} | EE-${incident.EEConsecutive}`,
    description,
    alternates: {
      canonical: env.SITE_URL ? new URL(canonicalUrl, env.SITE_URL).toString() : undefined
    },
    openGraph: {
      title: `${titleWithLocation}`,
      description,
      url: env.SITE_URL ? new URL(canonicalUrl, env.SITE_URL).toString() : undefined,
      type: "article",
      images: `${env.SITE_URL}${canonicalUrl}/og`
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleWithLocation}`,
      description
    }
  };
}

export default async function IncidentPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Extract ID from slug (supports both old format /incidentes/123 and new format /incidentes/123-slug-2025-01-01)
  const id = extractIncidentId(`/incidentes/${slug}`);

  if (!id) notFound();

  const incident = await getDetailedIncidentById(id);

  if (!incident) notFound();

  if (incident.isOpen) {
    cacheLife("openIncident");
  } else {
    cacheLife("closedIncident");
  }

  // const similar = await getSimilarIncidents(Number(id));
  const jsonLd = getJsonLd(incident);

  // Remove undefined properties from jsonLd
  if (jsonLd) {
    for (const key of Object.keys(jsonLd) as (keyof typeof jsonLd)[]) {
      if (jsonLd[key] === undefined) {
        delete jsonLd[key];
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: safe ld+json
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <article
        className="typography grid w-full max-w-none grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3"
        itemScope
        itemType="https://schema.org/Event"
      >
        {incident.isOpen && (
          <OpenIncidentBanner
            className="not-typography col-span-full"
            modifiedAt={incident.modifiedAt.toISOString()}
          />
        )}

        <div className="order-1 flex flex-col gap-4 md:gap-6 lg:order-1 lg:col-span-2">
          <h1 itemProp="headline">{getIncidentTitle(incident)}</h1>
          <figure>
            {areCoordinatesValid(incident.latitude, incident.longitude) ? (
              <IncidentMap
                latitude={Number(incident.latitude)}
                longitude={Number(incident.longitude)}
                stations={incident.dispatchedStations.map((station) => ({
                  latitude: Number(station.station.latitude),
                  longitude: Number(station.station.longitude),
                  name: station.station.name
                }))}
              />
            ) : (
              <div className="relative flex min-h-[400px] flex-col gap-4 overflow-hidden rounded-xl border-2 bg-muted">
                <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm">
                  <div className="mx-4 w-fit rounded-md bg-background/60 px-4 py-3 backdrop-blur-3xl">
                    <p className="select-none text-sm">
                      <TriangleAlertIcon
                        className="-mt-0.5 me-3 inline-flex text-amber-500"
                        size={16}
                        aria-hidden="true"
                      />
                      Coordenadas aún no disponibles.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </figure>
          <time dateTime={incident.incidentTimestamp.toISOString()}>
            {incident.incidentTimestamp.toLocaleString("es-CR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            })}
          </time>
          <IncidentNarrative incident={incident} />

          <section className="mt-6">
            <h2>Desglose de tiempos de vehículos despachados</h2>
            <Tabs defaultValue="chart" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="mt-2">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <TabsTrigger value="chart" className="py-3" aria-label="Ver gráfico">
                            <BarChartHorizontalIcon size={16} aria-hidden="true" />
                          </TabsTrigger>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="px-2 py-1 text-xs">Gráfico</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <TabsTrigger value="table" className="py-3" aria-label="Ver tabla">
                            <TableIcon size={16} aria-hidden="true" />
                          </TabsTrigger>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="px-2 py-1 text-xs">Tabla</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsList>
              </div>

              <TabsContent value="chart">
                <VehicleResponseTimeChart
                  vehicles={incident.dispatchedVehicles}
                  isOpen={incident.isOpen}
                />
              </TabsContent>

              <TabsContent value="table">
                <VehicleResponseTimeTable vehicles={incident.dispatchedVehicles} />
              </TabsContent>
            </Tabs>
          </section>

          {/* {similar.length > 0 && (
            <section aria-labelledby="nearby-heading">
              <h2 className="mt-6 font-semibold text-lg md:mt-8" id="nearby-heading">
                Incidentes cercanos recientes
              </h2>
              <ul className="flex flex-col gap-6 md:gap-8">
                {similar.map((incident) => (
                  <li key={incident.id}>
                    <IncidentCard incident={incident} />
                  </li>
                ))}
              </ul>
            </section>
          )} */}
        </div>

        <aside
          className="not-typography order-2 self-start lg:sticky lg:top-4 lg:order-2 lg:col-span-1"
          aria-label="Cronología del incidente"
        >
          <IncidentTimeline incident={incident} />
        </aside>
      </article>
    </>
  );
}
