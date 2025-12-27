"use client";

import { STATIONS_PER_PAGE } from "@/features/stations/stations-search-params";
import type { getStationsForDirectory } from "@bomberoscr/db/queries/stations";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { StationCard, StationCardSkeleton } from "./station-card";

interface StationsDirectoryListProps {
  stations: Awaited<ReturnType<typeof getStationsForDirectory>>;
}

export function StationsDirectoryList({ stations }: StationsDirectoryListProps) {
  if (stations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/40 text-center"
      >
        <MagnifyingGlassIcon className="size-10 text-muted-foreground/50" />
        <h3 className="mt-4 font-semibold text-lg">No se encontraron estaciones</h3>
        <p className="text-muted-foreground text-sm">Intenta con otros términos de búsqueda.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {stations.map((station, index) => (
          <motion.div
            key={station.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              delay: index * 0.03
            }}
          >
            <StationCard station={station} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function StationsDirectoryListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: STATIONS_PER_PAGE }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
        <StationCardSkeleton key={i} />
      ))}
    </div>
  );
}
