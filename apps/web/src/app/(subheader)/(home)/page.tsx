import { DailyIncidentsChart } from "@/features/dashboard/homepage/charts/components/daily-incidents-chart";
import { IncidentsByDayOfWeekChart } from "@/features/dashboard/homepage/charts/components/incidents-by-day-of-week-chart";
import { IncidentsByHourChart } from "@/features/dashboard/homepage/charts/components/incidents-by-hour-chart";
import { TopDispatchedStationsChart } from "@/features/dashboard/homepage/charts/components/top-stations-chart";
import { TopResponseTimesStationsChart } from "@/features/dashboard/homepage/charts/components/top-stations-response-time-chart";
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

async function getHomepageData(timeRange: number) {
  "use cache";
  cacheLife({ revalidate: 10 * 60 });
  cacheTag("homepage");

  const result = await Promise.all([
    getTopResponseTimesStations({ timeRange }),
    getTopDispatchedStations({ timeRange }),
    getDailyIncidents({ timeRange }),
    getIncidentsByDayOfWeek({ timeRange }),
    getIncidentsByHour({ timeRange })
  ]);

  return result;
}

export default async function Page() {
  await headers();
  const timeRange = 30;

  const [responseTimes, dispatchedStations, dailyIncidents, incidentsByDayOfWeek, incidentsByHour] =
    await getHomepageData(timeRange);

  return (
    <div className="flex flex-col gap-8">
      {/* <HighlightedIncidents /> */}
      <YearRecapHero />
      <MapCTA />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopDispatchedStationsChart stations={dispatchedStations} />
        <TopResponseTimesStationsChart stations={responseTimes} />
        <IncidentsByDayOfWeekChart incidents={incidentsByDayOfWeek} timeRange={timeRange} />
        <IncidentsByHourChart incidents={incidentsByHour} timeRange={timeRange} />
        <DailyIncidentsChart incidents={dailyIncidents} timeRange={timeRange} />
      </div>
      <Suspense
        fallback={
          <div className="flex w-full items-center justify-center p-8">
            <Skeleton className="aspect-[600/600] w-full max-w-[600px]" />
          </div>
        }
      >
        <ParticlesMap />
      </Suspense>
    </div>
  );
}
