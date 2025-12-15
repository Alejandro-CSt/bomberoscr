import type { MinimalIncident } from "@/features/dashboard/homepage/api/homepageRouter";
import {
  HighlightedIncidentCard,
  HighlightedIncidentCardSkeleton
} from "@/features/dashboard/homepage/components/highlighted-incident-card";
import {
  getValidTimeRange,
  loadTimeRangeSearchParams
} from "@/features/dashboard/homepage/time-range-search-params";
import { Tabs, TabsList, TabsTab } from "@/features/shared/components/ui/tabs";
import { buildIncidentUrl } from "@/features/shared/lib/utils";
import { getHighlightedIncidents } from "@bomberoscr/db/queries/homepage/highlightedIncidents";
import {
  ALLOWED_TIME_RANGE_VALUES,
  DEFAULT_TIME_RANGE,
  TIME_RANGE_LABELS
} from "@bomberoscr/lib/time-range";
import type { Route } from "next";
import { cacheLife } from "next/cache";
import type { SearchParams } from "nuqs/server";
import Link from "next/link";
import { Suspense } from "react";

interface HighlightedIncidentsListProps {
  searchParamsPromise: Promise<SearchParams>;
}

async function HighlightedIncidentsList({ searchParamsPromise }: HighlightedIncidentsListProps) {
  const { timeRange: rawTimeRange } = await loadTimeRangeSearchParams(searchParamsPromise);
  const timeRange = getValidTimeRange(rawTimeRange);

  async function fetchIncidents() {
    "use cache";
    cacheLife("homepage");
    return getHighlightedIncidents({ timeRange, limit: 6 });
  }

  const incidents = await fetchIncidents();

  const minimalIncidents: MinimalIncident[] = incidents.map((incident) => {
    const details = incident.details || "Incidente";
    return {
      id: incident.id,
      url: buildIncidentUrl(incident.id, details, new Date(incident.incidentTimestamp)) as Route,
      details,
      address: incident.address ?? "Ubicación pendiente",
      dispatchedStationsCount: incident.dispatchedStationsCount,
      dispatchedVehiclesCount: incident.dispatchedVehiclesCount,
      responsibleStation: incident.responsibleStation ?? "Estación pendiente",
      incidentTimestamp: incident.incidentTimestamp.toISOString(),
      latitude: incident.latitude,
      longitude: incident.longitude
    } satisfies MinimalIncident;
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-semibold text-xl lg:text-2xl">Destacados</h2>
        <Tabs value={String(timeRange)}>
          <TabsList variant="underline" className="h-8">
            {ALLOWED_TIME_RANGE_VALUES.map((value) => (
              <TabsTab
                key={value}
                value={String(value)}
                render={<Link href={{ pathname: "/", query: { timeRange: value } }} />}
                nativeButton={false}
                className="rounded-none border-none px-3 py-1.5 text-sm"
              >
                {TIME_RANGE_LABELS[value as keyof typeof TIME_RANGE_LABELS]}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {minimalIncidents.map((incident) => (
          <HighlightedIncidentCard key={incident.url} incident={incident} />
        ))}
      </div>
    </>
  );
}

function HighlightedIncidentsSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-semibold text-xl lg:text-2xl">Destacados</h2>
        <Tabs value={String(DEFAULT_TIME_RANGE)}>
          <TabsList variant="underline" className="h-8">
            {ALLOWED_TIME_RANGE_VALUES.map((value) => (
              <TabsTab
                key={value}
                value={String(value)}
                render={<Link href={{ pathname: "/", query: { timeRange: value } }} />}
                nativeButton={false}
                className="rounded-none border-none px-3 py-1.5 text-sm"
              >
                {TIME_RANGE_LABELS[value as keyof typeof TIME_RANGE_LABELS]}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <HighlightedIncidentCardSkeleton key={key} />
        ))}
      </div>
    </>
  );
}

interface HighlightedIncidentsProps {
  searchParams: Promise<SearchParams>;
}

export function HighlightedIncidents({ searchParams }: HighlightedIncidentsProps) {
  return (
    <section className="flex flex-col gap-4 pt-8">
      <Suspense fallback={<HighlightedIncidentsSkeleton />}>
        <HighlightedIncidentsList searchParamsPromise={searchParams} />
      </Suspense>
    </section>
  );
}
