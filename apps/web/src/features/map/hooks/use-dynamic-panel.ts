"use client";

import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

export enum PanelView {
  Incidents = "incidentes",
  Options = "opciones",
  Statistics = "estadisticas",
  Station = "estacion"
}

export enum TabName {
  Details = "detalles",
  Incidents = "incidentes",
  Stats = "estadisticas"
}

const viewParser = parseAsStringEnum<PanelView>(Object.values(PanelView)).withOptions({
  shallow: true
});

const tabParser = parseAsStringEnum<TabName>(Object.values(TabName)).withOptions({
  shallow: true
});

export function useDynamicPanel() {
  return useQueryStates(
    {
      view: viewParser.withOptions({ shallow: true, history: "push" }),
      incidentId: parseAsInteger.withOptions({ shallow: true, history: "push" }),
      stationKey: parseAsString.withOptions({ shallow: true, history: "push" }),
      stationTab: tabParser.withOptions({ shallow: true }),
      title: parseAsString.withOptions({ shallow: true, history: "push" })
    },
    {
      urlKeys: {
        view: "view",
        incidentId: "incident",
        stationKey: "station",
        title: "title",
        stationTab: "tab"
      }
    }
  );
}
