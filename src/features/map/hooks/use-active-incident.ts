"use client";

import { parseAsBoolean, parseAsInteger, useQueryStates } from "nuqs";

export function useActiveIncident() {
  return useQueryStates(
    {
      incidentId: parseAsInteger.withOptions({ shallow: true }),
      fullScreen: parseAsBoolean.withDefault(false).withOptions({ shallow: true })
    },
    {
      urlKeys: {
        incidentId: "incidente",
        fullScreen: "fs"
      }
    }
  );
}
