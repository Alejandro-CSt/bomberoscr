"use client";

import { Badge } from "@/features/components/ui/badge";
import { PanelView, useDynamicPanel } from "@/features/map/hooks/use-dynamic-panel";
import { getRelativeTime } from "@/lib/utils";
import type { LatestIncident } from "@/server/trpc";

export function IncidentCard({ incident }: { incident: LatestIncident }) {
  const [_, setDynamicPanel] = useDynamicPanel();

  const handleClick = () => {
    setDynamicPanel({
      view: PanelView.Incidents,
      incidentId: incident.id,
      title: incident.specificIncidentType,
      stationKey: null,
      stationTab: null
    });
  };

  return (
    <button
      type="button"
      className="flex w-full cursor-pointer flex-col gap-3 rounded-lg border p-4 text-left transition-colors delay-75 duration-300 hover:bg-accent"
      onClick={handleClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === "space") && handleClick()}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {incident.specificIncidentType || incident.incidentType || "Incidente Desconocido"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {getRelativeTime(incident.incidentTimestamp)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={incident.isOpen ? "destructive" : "default"}>
            {incident.isOpen ? "Atendiendo" : "Atendido"}
          </Badge>
          <div className="ustify-end flex gap-2">
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

      <div className="gap1 flex flex-col">
        <span className="font-medium text-muted-foreground text-xs">Responsable</span>
        <span className="font-semibold text-muted-foreground text-sm">
          {incident.responsibleStation}
        </span>
      </div>
    </button>
  );
}
