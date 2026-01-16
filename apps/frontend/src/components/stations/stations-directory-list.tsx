import { MagnifyingGlass } from "@phosphor-icons/react";

import { StationCard, StationCardSkeleton } from "./station-card";

interface StationsDirectoryListProps {
  stations: Array<{
    id: number;
    name: string;
    stationKey: string;
    address: string | null;
  }>;
}

export function StationsDirectoryList({ stations }: StationsDirectoryListProps) {
  if (stations.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/40 text-center">
        <MagnifyingGlass className="size-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No se encontraron estaciones</h3>
        <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
        />
      ))}
    </div>
  );
}

export function StationsDirectoryListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <StationCardSkeleton key={i} />
      ))}
    </div>
  );
}
