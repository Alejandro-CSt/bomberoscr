import type { stationsInsertSchema } from "@/server/db/schema";
import { useEffect, useState } from "react";
import type { z } from "zod";

export type Station = z.infer<typeof stationsInsertSchema>;

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    async function fetchStations() {
      const stations = await fetch("/api/stations").then((res) => res.json());
      setStations(stations);
    }

    fetchStations();
  }, []);

  return stations;
}
