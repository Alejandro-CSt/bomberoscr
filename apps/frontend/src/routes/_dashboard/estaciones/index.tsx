import { FireTruck, Shield, Timer } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { StationStatCard, StationStatCardSkeleton } from "@/components/stations/station-stat-card";
import {
  StationsDirectoryList,
  StationsDirectoryListSkeleton
} from "@/components/stations/stations-directory-list";
import { StationsPagination } from "@/components/stations/stations-pagination";
import { StationsSearchControls } from "@/components/stations/stations-search-controls";
import {
  getStationsOptions,
  getStatsSystemOverviewOptions
} from "@/lib/api/@tanstack/react-query.gen";
import { formatMinutesToHMS } from "@/lib/utils";

const STATIONS_PER_PAGE = 9;

const searchParamsSchema = z.object({
  q: z.string().optional().default(""),
  page: z.coerce.number().optional().default(0)
});

const title = "Estaciones de Bomberos — Emergencias CR";
const description =
  "Consulta el directorio de estaciones de bomberos de Costa Rica, con datos de ubicación, unidades y estadísticas de respuesta.";

export const Route = createFileRoute("/_dashboard/estaciones/")({
  validateSearch: searchParamsSchema,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description }
    ]
  }),
  component: EstacionesPage
});

function EstacionesPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<StatsSkeletonSection />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<DirectorySkeletonSection />}>
        <DirectorySection />
      </Suspense>
    </div>
  );
}

function StatsSection() {
  const { data: stats } = useSuspenseQuery(getStatsSystemOverviewOptions());

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StationStatCard
        title="Estaciones operativas"
        value={stats.stationCount}
        icon={Shield}
      />
      <StationStatCard
        title="Vehículos activos"
        value={stats.activeVehicleCount}
        icon={FireTruck}
      />
      <StationStatCard
        title="Tiempo respuesta promedio"
        value={
          stats.avgResponseTimeMinutes ? formatMinutesToHMS(stats.avgResponseTimeMinutes) : "—"
        }
        icon={Timer}
      />
    </div>
  );
}

function StatsSkeletonSection() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StationStatCardSkeleton />
      <StationStatCardSkeleton />
      <StationStatCardSkeleton />
    </div>
  );
}

function DirectorySection() {
  const navigate = useNavigate();
  const { q, page } = Route.useSearch();

  const [inputValue, setInputValue] = useState(q);
  const deferredSearch = useDeferredValue(inputValue);
  const isPending = inputValue !== deferredSearch;

  // Sync URL params to local state on external navigation
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // Debounced URL update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (deferredSearch !== q) {
        navigate({
          search: { q: deferredSearch || undefined, page: 0 },
          replace: true
        });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [deferredSearch, q, navigate]);

  const { data } = useSuspenseQuery(
    getStationsOptions({
      query: { limit: 500, view: "default" }
    })
  );

  const stations = data.view === "default" ? data.stations : [];

  const { filteredStations, totalPages, safePage, currentStations } = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase();
    const matchedStations = deferredSearch
      ? stations.filter((s) => s.name.toLowerCase().includes(searchLower))
      : stations;

    const sorted = [...matchedStations].sort((a, b) =>
      a.stationKey.localeCompare(b.stationKey, undefined, { numeric: true })
    );

    const total = Math.ceil(sorted.length / STATIONS_PER_PAGE);
    const safe = Math.max(0, Math.min(page, total - 1));
    const startIndex = safe * STATIONS_PER_PAGE;
    const current = sorted.slice(startIndex, startIndex + STATIONS_PER_PAGE);

    return {
      filteredStations: sorted,
      totalPages: total || 1,
      safePage: safe,
      currentStations: current
    };
  }, [stations, deferredSearch, page]);

  const handleSearchChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      navigate({
        search: { q: q || undefined, page: newPage },
        replace: true
      });
    },
    [navigate, q]
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Directorio</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <StationsSearchControls
            value={inputValue}
            onChange={handleSearchChange}
            isPending={isPending}
          />
          <StationsPagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isPending={isPending}
          />
        </div>
      </div>
      <StationsDirectoryList stations={currentStations} />
    </section>
  );
}

function DirectorySkeletonSection() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Directorio</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <StationsSearchControls
            value=""
            onChange={() => {}}
          />
          <StationsPagination
            currentPage={0}
            totalPages={1}
            onPageChange={() => {}}
          />
        </div>
      </div>
      <StationsDirectoryListSkeleton />
    </section>
  );
}
