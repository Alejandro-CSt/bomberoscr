import {
  ChartSkeleton,
  ChartSkeletonWithFooter
} from "@/features/dashboard/homepage/charts/components/chart-skeleton";
import { DailyIncidentsChart } from "@/features/dashboard/homepage/charts/components/daily-incidents-chart";
import { IncidentsByDayOfWeekChart } from "@/features/dashboard/homepage/charts/components/incidents-by-day-of-week-chart";
import { IncidentsByHourChart } from "@/features/dashboard/homepage/charts/components/incidents-by-hour-chart";
import { TopDispatchedStationsChart } from "@/features/dashboard/homepage/charts/components/top-stations-chart";
import { TopResponseTimesStationsChart } from "@/features/dashboard/homepage/charts/components/top-stations-response-time-chart";
import { HighlightedIncidents } from "@/features/dashboard/homepage/components/highlighted-incidents";
import { LatestIncidents } from "@/features/dashboard/homepage/components/latest-incidents";
import { MapCTA } from "@/features/dashboard/homepage/components/map-cta";
import { YearRecapHero } from "@/features/dashboard/homepage/components/year-recap-hero";
import env from "@/features/lib/env";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { getDailyIncidents } from "@bomberoscr/db/queries/charts/dailyIncidents";
import { getIncidentsByDayOfWeek } from "@bomberoscr/db/queries/charts/incidentsByDayOfWeek";
import { getIncidentsByHour } from "@bomberoscr/db/queries/charts/incidentsByHour";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { getTopResponseTimesStations } from "@bomberoscr/db/queries/charts/topResponseTimesStations";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { headers } from "next/headers";
import type { SearchParams } from "nuqs/server";
import { Suspense, lazy } from "react";

const ParticlesMap = lazy(() => import("@/features/dashboard/homepage/components/particles-map"));

const homepageDescription =
  "Indicadores clave de incidentes en Costa Rica, tendencias recientes y mapa interactivo de emergencias.";

export const metadata: Metadata = {
  description: homepageDescription,
  alternates: {
    canonical: env.SITE_URL ? new URL("/", env.SITE_URL).toString() : undefined
  },
  openGraph: {
    description: homepageDescription,
    url: env.SITE_URL ? new URL("/", env.SITE_URL).toString() : undefined,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    description: homepageDescription
  }
};

const TIME_RANGE = 30;

async function TopStationsCharts() {
  "use cache";
  cacheLife({ revalidate: 10 * 60 });
  cacheTag("homepage");

  const [dispatchedStations, responseTimes] = await Promise.all([
    getTopDispatchedStations({ timeRange: TIME_RANGE }),
    getTopResponseTimesStations({ timeRange: TIME_RANGE })
  ]);

  return (
    <>
      <TopDispatchedStationsChart stations={dispatchedStations} />
      <TopResponseTimesStationsChart stations={responseTimes} />
    </>
  );
}

async function IncidentDistributionCharts() {
  "use cache";
  cacheLife({ revalidate: 10 * 60 });
  cacheTag("homepage");

  const [incidentsByDayOfWeek, incidentsByHour, dailyIncidents] = await Promise.all([
    getIncidentsByDayOfWeek({ timeRange: TIME_RANGE }),
    getIncidentsByHour({ timeRange: TIME_RANGE }),
    getDailyIncidents({ timeRange: TIME_RANGE })
  ]);

  return (
    <>
      <IncidentsByDayOfWeekChart incidents={incidentsByDayOfWeek} timeRange={TIME_RANGE} />
      <IncidentsByHourChart incidents={incidentsByHour} timeRange={TIME_RANGE} />
      <DailyIncidentsChart incidents={dailyIncidents} timeRange={TIME_RANGE} />
    </>
  );
}

function TopStationsChartsSkeleton() {
  return (
    <>
      <ChartSkeleton
        title="Estaciones más despachadas"
        description="Estaciones con más despachos (responsable y apoyo) - Últimos 30 días"
      />
      <ChartSkeletonWithFooter
        title="Tiempos de respuesta"
        description="Las 3 estaciones más rápidas, más lentas y promedio nacional - Últimos 365 días"
      />
    </>
  );
}

function IncidentDistributionChartsSkeleton() {
  return (
    <>
      <ChartSkeleton
        title="Incidentes por día de la semana"
        description="Distribución de incidentes por día - Últimos 30 días"
      />
      <ChartSkeleton
        title="Incidentes por hora del día"
        description="Distribución de incidentes por hora - Últimos 30 días"
      />
      <ChartSkeletonWithFooter
        title="Incidentes diarios"
        description="Comparación de incidentes por día - 30 días actual vs anterior"
        className="col-span-full"
      />
    </>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await headers(); // disable prerendering

  return (
    <div className="flex flex-col gap-8">
      <HighlightedIncidents searchParams={searchParams} />
      <LatestIncidents />
      <MapCTA />
      <YearRecapHero />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<TopStationsChartsSkeleton />}>
          <TopStationsCharts />
        </Suspense>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<IncidentDistributionChartsSkeleton />}>
          <IncidentDistributionCharts />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="flex w-full items-center justify-center p-8">
            <Skeleton className="aspect-square w-full max-w-[600px]" />
          </div>
        }
      >
        <ParticlesMap />
      </Suspense>
    </div>
  );
}
