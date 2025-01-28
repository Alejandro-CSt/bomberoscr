import type { incidentsInsertSchema } from "@/server/db/schema";
import { useEffect, useState } from "react";
import type { z } from "zod";

export type Incident = z.infer<typeof incidentsInsertSchema>;

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    async function fetchIncidents() {
      const incidents = await fetch("/api/incidents").then((res) => res.json());
      setIncidents(incidents);
    }

    fetchIncidents();
  }, []);

  return incidents;
}

export type StationIncident = {
  incident: {
    id: number;
    incidentCode?: string;
    specificIncidentCode?: string;
    dispatchIncidentCode?: string;
    specificDispatchIncidentCode?: string;
    EEConsecutive: string;
    address: string;
    responsibleStation: number;
    incidentTimestamp: string;
    importantDetails: string;
    latitude: string;
    longitude: string;
    provinceId: number;
    cantonId: number;
    districtId: number;
    isOpen: boolean;
  };
};

export function useStationIncidents(stationId: number) {
  const [incidents, setIncidents] = useState<StationIncident[]>([]);

  useEffect(() => {
    async function fetchIncidents() {
      const incidents = await fetch(`/api/incidents/station/${stationId}`).then((res) =>
        res.json()
      );
      setIncidents(incidents);
    }

    fetchIncidents();
  }, [stationId]);

  return incidents;
}
