import env from "@/features/lib/env";
import { formatMinutesToHMS } from "@/features/shared/lib/utils";
import {
  StationStatCard,
  StationStatCardSkeleton
} from "@/features/stations/components/station-stat-card";
import {
  StationsDirectoryList,
  StationsDirectoryListSkeleton
} from "@/features/stations/components/stations-directory-list";
import { StationsDirectoryPagination } from "@/features/stations/components/stations-directory-pagination";
import { StationsSearchControls } from "@/features/stations/components/stations-search-controls";
import {
  STATIONS_PER_PAGE,
  stationsSearchParamsCache
} from "@/features/stations/stations-search-params";
import { getStationsForDirectory } from "@bomberoscr/db/queries/stations";
import { getSystemOverview } from "@bomberoscr/db/queries/systemOverview";
import { FireTruckIcon, ShieldIcon, TimerIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

const stationsDescription =
  "Directorio de estaciones de bomberos con información de cobertura y ubicación.";

export const metadata: Metadata = {
  title: "Estaciones de bomberos",
  description: stationsDescription,
  alternates: {
    canonical: env.SITE_URL ? new URL("/estaciones", env.SITE_URL).toString() : undefined
  },
  openGraph: {
    title: "Estaciones de bomberos",
    description: stationsDescription,
    url: env.SITE_URL ? new URL("/estaciones", env.SITE_URL).toString() : undefined,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Estaciones de bomberos",
    description: stationsDescription
  }
};

async function StationsStats() {
  "use cache";
  cacheLife({ revalidate: 3600 });

  const stats = await getSystemOverview();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StationStatCard title="Estaciones operativas" value={stats.stationCount} icon={ShieldIcon} />
      <StationStatCard
        title="Vehículos activos"
        value={stats.activeVehicleCount}
        icon={FireTruckIcon}
      />
      <StationStatCard
        title="Tiempo respuesta promedio"
        value={
          stats.avgResponseTimeMinutes ? formatMinutesToHMS(stats.avgResponseTimeMinutes) : "N/A"
        }
        icon={TimerIcon}
      />
    </div>
  );
}

function StationsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StationStatCardSkeleton />
      <StationStatCardSkeleton />
      <StationStatCardSkeleton />
    </div>
  );
}

async function getStations() {
  "use cache";
  cacheLife({ revalidate: 3600 });
  return getStationsForDirectory();
}

interface StationsDirectoryProps {
  searchParamsPromise: Promise<SearchParams>;
}

async function StationsDirectory({ searchParamsPromise }: StationsDirectoryProps) {
  const { q, page } = await stationsSearchParamsCache.parse(searchParamsPromise);
  const stations = await getStations();

  const searchLower = q.toLowerCase();
  const matchedStations = q
    ? stations.filter((station) => station.name.toLowerCase().includes(searchLower))
    : stations;

  const filteredStations = [...matchedStations].sort((a, b) =>
    a.stationKey.localeCompare(b.stationKey, undefined, { numeric: true })
  );

  const totalPages = Math.ceil(filteredStations.length / STATIONS_PER_PAGE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const startIndex = safePage * STATIONS_PER_PAGE;
  const currentStations = filteredStations.slice(startIndex, startIndex + STATIONS_PER_PAGE);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-semibold text-xl tracking-tight">Directorio</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Suspense>
            <StationsSearchControls />
          </Suspense>
          <StationsDirectoryPagination totalPages={totalPages} />
        </div>
      </div>
      <StationsDirectoryList stations={currentStations} />
    </section>
  );
}

function StationsDirectorySkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-72" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <StationsDirectoryListSkeleton />
    </section>
  );
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default function EstacionesPage({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<StationsStatsSkeleton />}>
        <StationsStats />
      </Suspense>
      <Suspense fallback={<StationsDirectorySkeleton />}>
        <StationsDirectory searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
