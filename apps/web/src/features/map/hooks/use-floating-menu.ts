"use client";

import { parseAsBoolean, useQueryStates } from "nuqs";

export function useFloatingMenu() {
  return useQueryStates(
    {
      recentIncidents: parseAsBoolean.withDefault(false),
      options: parseAsBoolean.withDefault(false)
    },
    {
      urlKeys: {
        recentIncidents: "incidentesRecientes",
        options: "opciones"
      }
    }
  );
}
