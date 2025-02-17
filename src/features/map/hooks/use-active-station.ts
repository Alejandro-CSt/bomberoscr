"use client";

import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

export enum TabName {
  Details = "detalles",
  Incidents = "incidentes",
  Stats = "estadisticas",
  Share = "compartir"
}

const tabParser = parseAsStringEnum<TabName>(Object.values(TabName)).withOptions({
  shallow: true
});

export function useActiveStation() {
  return useQueryStates(
    {
      stationKey: parseAsString.withOptions({ shallow: true }),
      stationName: parseAsString.withOptions({ shallow: true }),
      tab: tabParser
    },
    {
      urlKeys: {
        stationKey: "claveEstacion",
        stationName: "nombreEstacion",
        tab: "t"
      }
    }
  );
}
