"use client";

import { Badge } from "@/features/components/ui/badge";
import { getRelativeTime } from "@/lib/utils";
import type { getLatestIncidents } from "@/server/queries";
import type { LatestIncident } from "@/server/trpc";
import Link from "next/link";

export function IncidentCard({
  incident
}: { incident: Awaited<ReturnType<typeof getLatestIncidents>>[number] | LatestIncident }) {
  return (
    <Link
      href={`/incidentes/${incident.id}`}
      className="flex w-full cursor-pointer flex-col gap-3 rounded-lg border p-4 text-left transition-colors delay-75 duration-300 hover:bg-accent"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {incident.specificIncidentType || incident.incidentType || "Incidente Desconocido"}
          </h3>
          <p className="text-muted-foreground text-sm first-letter:capitalize">
            {getRelativeTime(incident.incidentTimestamp.toString())}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={incident.isOpen ? "destructive" : "default"}>
            {incident.isOpen ? "Atendiendo" : "Atendido"}
          </Badge>
          <div className="flex gap-2">
            <Badge variant="outline">
              {incident.dispatchedStationsCount}{" "}
              {incident.dispatchedStationsCount === 1 ? "estación" : "estaciones"}
            </Badge>
            <Badge variant="outline">
              {incident.dispatchedVehiclesCount}{" "}
              {incident.dispatchedVehiclesCount === 1 ? "unidad" : "unidades"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="line-clamp-3 text-muted-foreground text-sm">
        {incident.address || "Ubicación no disponible"}
      </div>

      <div className="flex flex-col">
        <span className="text-muted-foreground text-xs">Responsable</span>
        <span className="font-semibold text-sm">{incident.responsibleStation}</span>
      </div>
    </Link>
  );
}
