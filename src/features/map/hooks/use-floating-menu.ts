"use client";

import { parseAsBoolean, useQueryStates } from "nuqs";

export function useFloatingMenu() {
  return useQueryStates(
    {
      recentIncidents: parseAsBoolean
        .withDefault(false)
        .withOptions({ shallow: true, history: "push" }),
      options: parseAsBoolean.withDefault(false).withOptions({ shallow: true })
    },
    {
      urlKeys: {
        recentIncidents: "incidentesRecientes",
        options: "opciones"
      }
    }
  );
}
