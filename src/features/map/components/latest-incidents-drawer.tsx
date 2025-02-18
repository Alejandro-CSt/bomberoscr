"use client";

import { Button } from "@/features/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/features/components/ui/select";
import { useMediaQuery } from "@/features/hooks/use-media-query";
import { ResponsiveDrawer } from "@/features/map/components/responsive-drawer";
import { useActiveIncident } from "@/features/map/hooks/use-active-incident";
import { useFloatingMenu } from "@/features/map/hooks/use-floating-menu";
import { trpc } from "@/lib/trpc/client";
import { getRelativeTime } from "@/lib/utils";
import type { LatestIncident } from "@/server/trpc";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export function LatestIncidentsDrawer() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [floatingMenu, setFloatingMenu] = useFloatingMenu();
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
    <ResponsiveDrawer
      isOpen={floatingMenu.recentIncidents}
      title="Incidentes recientes"
      onCloseAction={() => {
        if (floatingMenu.recentIncidents) {
          setTimeout(() => setFloatingMenu({ recentIncidents: false }), 200);
        }
      }}
      snapPoints={!isDesktop ? ["384px", 1] : null}
    >
      <div className="flex min-h-full flex-col gap-4">
        <div className="flex items-center">
          <span className="mr-2 text-muted-foreground text-sm">Filtrar</span>
          <Select onValueChange={handleStationChange} defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las estaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las estaciones</SelectItem>
              {stations?.map((station) => (
                <SelectItem key={station.id} value={station.name}>
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
                className="gap- w2 mx-auto my-4 flex items-center justify-center"
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
    </ResponsiveDrawer>
  );
}

export const IncidentCard = ({ incident }: { incident: LatestIncident }) => {
  const [, setActiveIncident] = useActiveIncident();

  const handleClick = () => {
    setActiveIncident({ incidentId: incident.id });
  };

  return (
    <button
      type="button"
      className="flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <div className="flex w-full items-baseline justify-between gap-8">
        <span className="whitespace-nowrap font-medium text-muted-foreground text-sm">
          {new Date().getTime() - new Date(incident.incidentTimestamp).getTime() <=
          1000 * 60 * 60 * 24
            ? getRelativeTime(incident.incidentTimestamp)
            : new Date(incident.incidentTimestamp).toLocaleString("es-CR", {
                timeStyle: "short",
                dateStyle: "medium"
              })}
        </span>
        <span className="whitespace-normal text-end font-semibold text-primary text-sm">
          {incident.specificIncidentType}
        </span>
      </div>
      <p className="line-clamp-2 w-full text-start text-muted-foreground text-sm">
        {incident.address}
      </p>
      <div className="mt-2 flex w-full items-center justify-between">
        <span className="font-medium text-sm">{incident.responsibleStation}</span>
        <span className="group flex h-auto items-center gap-2 underline underline-offset-2">
          Ver más{" "}
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
};
