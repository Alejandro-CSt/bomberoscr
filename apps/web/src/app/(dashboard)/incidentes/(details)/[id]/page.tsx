"use cache";

import { IncidentHeader } from "@/features/dashboard/incidents/incident-header";
import IncidentTimeline from "@/features/dashboard/incidents/incident-timeline";
import IncidentMap from "@/features/dashboard/incidents/map/components/incident-map";
import OpenIncidentBanner from "@/features/dashboard/incidents/open-incident-banner";
import { VehicleResponseTimeChart } from "@/features/dashboard/incidents/vehicle-response-time-chart";
import { VehicleResponseTimeTable } from "@/features/dashboard/incidents/vehicle-response-time-table";
import { IncidentCard } from "@/features/map/incidents/components/incident-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/shared/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/features/shared/components/ui/tooltip";
import { getDetailedIncidentById, getSimilarIncidents } from "@bomberoscr/db/queries/incidents";
import { BarChartHorizontalIcon, TableIcon, TriangleAlertIcon } from "lucide-react";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { notFound } from "next/navigation";

export default async function IncidentPage(props: PageProps<"/incidentes/[id]">) {
  const { id } = await props.params;
  const incident = await getDetailedIncidentById(Number(id));

  if (!incident) notFound();

  const similar = await getSimilarIncidents(Number(id));

  if (incident.isOpen) {
    cacheLife("openIncident");
  } else {
    cacheLife("closedIncident");
  }

  const areCoordinatesValid = Number(incident.latitude) !== 0 && Number(incident.longitude) !== 0;

  const dispatchGeneral = incident.dispatchIncidentType?.name ?? "";
  const dispatchSpecific = incident.specificDispatchIncidentType?.name ?? "";
  const onSceneGeneral = incident.incidentType?.name ?? "";
  const onSceneSpecific = incident.specificIncidentType?.name ?? "";
  const joinType = (general: string, specific: string) => {
    const g = general.trim();
    const s = specific.trim();
    if (g && s) return `${g}, ${s}`;
    return g || s || "N/A";
  };
  const initialType = joinType(dispatchGeneral, dispatchSpecific);
  const onSceneType = joinType(onSceneGeneral, onSceneSpecific);
  const typesMatch =
    initialType !== "N/A" && initialType.toLowerCase() === onSceneType.toLowerCase();

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-4 md:gap-8 lg:grid-cols-3">
      {incident.isOpen && (
        <OpenIncidentBanner
          className="col-span-full"
          modifiedAt={incident.modifiedAt.toISOString()}
        />
      )}

      <div className="order-1 flex flex-col gap-6 md:gap-8 lg:order-1 lg:col-span-2">
        <IncidentHeader incident={incident} />
        {areCoordinatesValid ? (
          <IncidentMap
            latitude={Number(incident.latitude)}
            longitude={Number(incident.longitude)}
            stations={incident.dispatchedStations.map((station) => ({
              latitude: Number(station.station.latitude),
              longitude: Number(station.station.longitude),
              name: station.station.name
            }))}
          />
        ) : (
          <div className="relative flex h-[400px] flex-col gap-4 overflow-hidden rounded-xl bg-muted">
            <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm">
              <div className="mx-4 w-fit rounded-md bg-background/60 px-4 py-3 backdrop-blur-3xl">
                <p className="select-none text-sm">
                  <TriangleAlertIcon
                    className="-mt-0.5 me-3 inline-flex text-amber-500"
                    size={16}
                    aria-hidden="true"
                  />
                  Coordenadas aún no disponibles.
                </p>
              </div>
            </div>
          </div>
        )}
        <p className="max-w-prose text-muted-foreground leading-relaxed">{incident.address}</p>
        <div className="border-t pt-4 md:pt-6">
          {typesMatch ? (
            <p className="text-muted-foreground">Reportado como {initialType}.</p>
          ) : (
            <p className="text-muted-foreground">
              Inicialmente se reporta al 9-1-1 como {initialType}.<br /> Bomberos en la escena lo
              reportan como {onSceneType}.
            </p>
          )}
        </div>

        <div className="flex basis-1/2 flex-col gap-6 md:gap-8">
          <Tabs defaultValue="chart" className="w-full">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Desglose de vehículos despachados</h2>
              <TabsList>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="chart" className="py-3">
                          <BarChartHorizontalIcon size={16} aria-hidden="true" />
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">Gráfico</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="table" className="py-3">
                          <TableIcon size={16} aria-hidden="true" />
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">Tabla</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>
            </div>

            <TabsContent value="chart">
              <VehicleResponseTimeChart
                vehicles={incident.dispatchedVehicles}
                isOpen={incident.isOpen}
              />
            </TabsContent>

            <TabsContent value="table">
              <VehicleResponseTimeTable vehicles={incident.dispatchedVehicles} />
            </TabsContent>
          </Tabs>
        </div>

        {similar.length > 0 && (
          <>
            <h2 className="mt-6 font-semibold text-lg md:mt-8">Incidentes cercanos recientes</h2>
            <div className="flex flex-col gap-6 md:gap-8">
              {similar.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          </>
        )}
      </div>

      <aside className="order-2 self-start lg:sticky lg:top-4 lg:order-2 lg:col-span-1">
        <IncidentTimeline incident={incident} />
      </aside>
    </div>
  );
}
