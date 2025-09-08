"use client";

import { IncidentCard } from "@/features/map/incidents/components/incident-card";
import { FloatingPanelHeader } from "@/features/map/layout/components/floating-panel-header";
import { Button } from "@/features/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/shared/components/ui/select";
import { trpc } from "@/features/trpc/client";
import type { LatestIncident } from "@/features/trpc/incidents";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Incidents() {
  const [results, setResults] = useState<LatestIncident[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("all");

  const { data, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.incidents.infiniteIncidents.useInfiniteQuery(
      {
        limit: 15,
        stationFilter: selectedStation === "all" ? null : selectedStation
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );
  const { data: stations } = trpc.stations.getStations.useQuery({ filter: "operative" });

  useEffect(() => {
    if (data) {
      const newIncidents = data.pages.flatMap((page) => page.items);
      setResults(newIncidents);
    }
  }, [data]);

  const handleStationChange = (value: string) => {
    setSelectedStation(value);
    setResults([]);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <FloatingPanelHeader title="Incidentes" />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center">
          <span className="mr-2 text-muted-foreground text-sm">Filtrar</span>
          <Select onValueChange={handleStationChange} defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las estaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las estaciones</SelectItem>
              {stations?.map((station) => (
                <SelectItem key={station.id} value={station.stationKey}>
                  {station.name} {station.stationKey}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isPending ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mb-8 flex flex-col gap-2 md:overflow-y-auto">
            {results.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
            {hasNextPage && (
              <Button
                variant="outline"
                className="mx-auto my-4 flex items-center justify-center gap-2"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  "Cargar más"
                )}
              </Button>
            )}
            {!hasNextPage && results.length > 0 && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No hay más incidentes para mostrar.
              </p>
            )}
            {results.length === 0 && !isPending && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No se encontraron incidentes para la estación seleccionada.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
