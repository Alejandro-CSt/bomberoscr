import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo } from "react";

import { StationsDirectoryList } from "@/components/stations/stations-directory-list";
import { StationsDirectoryPagination } from "@/components/stations/stations-directory-pagination";
import { StationsDirectorySearchControls } from "@/components/stations/stations-directory-search-controls";
import {
  STATIONS_PER_PAGE,
  stationsSearchParamsParsers
} from "@/components/stations/stations-directory-search-params";
import { getStationsOptions } from "@/lib/api/@tanstack/react-query.gen";

export function StationsDirectorySectionSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Directorio</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no unique id
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </section>
  );
}

export function StationsDirectorySection() {
  const [{ q, page }, setParams] = useQueryStates(stationsSearchParamsParsers);

  const {
    data: { stations }
  } = useSuspenseQuery({
    ...getStationsOptions({ query: { view: "directory" } }),
    staleTime: Infinity
  });

  const filteredStations = useMemo(() => {
    if (!q) return stations;

    const searchTerm = q.toLowerCase().trim();
    return stations.filter(
      (station) =>
        station.name.toLowerCase().includes(searchTerm) ||
        station.stationKey.toLowerCase().includes(searchTerm)
    );
  }, [stations, q]);

  const totalPages = Math.max(1, Math.ceil(filteredStations.length / STATIONS_PER_PAGE));

  const validPage = Math.min(page, totalPages - 1);
  useEffect(() => {
    if (validPage !== page) {
      setParams({ page: validPage });
    }
  }, [validPage, page, setParams]);

  const paginatedStations = useMemo(() => {
    const start = validPage * STATIONS_PER_PAGE;
    return filteredStations.slice(start, start + STATIONS_PER_PAGE);
  }, [filteredStations, validPage]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Directorio</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <StationsDirectorySearchControls />
          <StationsDirectoryPagination totalPages={totalPages} />
        </div>
      </div>
      <StationsDirectoryList stations={paginatedStations} />
    </section>
  );
}
