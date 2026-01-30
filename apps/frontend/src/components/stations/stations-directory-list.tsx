import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";

import { StationsDirectoryCard } from "@/components/stations/stations-directory-card";

import type { GetStationByNameResponse } from "@/lib/api/types.gen";

export function StationsDirectoryList({
  stations
}: {
  stations: GetStationByNameResponse["station"][];
}) {
  if (stations.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/40 text-center">
        <MagnifyingGlassIcon className="size-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No se encontraron estaciones</h3>
        <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {stations.map((station) => (
          <motion.div
            key={station.stationKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <StationsDirectoryCard station={station} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
