"use client";

import { parseAsInteger, useQueryStates } from "nuqs";

export function useActiveIncident() {
  return useQueryStates(
    {
      incidentId: parseAsInteger.withOptions({ shallow: true })
    },
    {
      urlKeys: {
        incidentId: "incidente"
      }
    }
  );
}
