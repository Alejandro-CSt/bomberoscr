"use client";

import { Button } from "@/features/components/ui/button";
import { DrawerClose, DrawerHeader, DrawerTitle } from "@/features/components/ui/drawer";
import { ScrollArea } from "@/features/components/ui/scroll-area";
import { Separator } from "@/features/components/ui/separator";
import { ResponsiveDrawer } from "@/features/map/components/responsive-drawer";
import { useActiveIncident } from "@/features/map/hooks/use-active-incident";
import { useFloatingMenu } from "@/features/map/hooks/use-floating-menu";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { LatestIncident } from "@/server/trpc";
import { ArrowRightIcon, Loader2Icon, XIcon } from "lucide-react";
import { Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";

const geist = Geist_Mono({ subsets: ["latin"], weight: "variable" });

export function LatestIncidentsDrawer() {
  const [floatingMenu, setFloatingMenu] = useFloatingMenu();
  const [results, setResults] = useState<LatestIncident[]>([]);
  const { data, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.incidents.infiniteIncidents.useInfiniteQuery(
      {
        limit: 15
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  useEffect(() => {
    if (data) {
      setResults((prev) => {
        const newIncidents = data.pages[data.pages.length - 1].items;
        const uniqueIncidents = newIncidents.filter(
          (incident) => !prev.some((prevIncident) => prevIncident.id === incident.id)
        );
        return [...prev, ...uniqueIncidents];
      });
    }
  }, [data]);

  return (
    <ResponsiveDrawer
      isOpen={floatingMenu.recentIncidents}
      onClose={() => setFloatingMenu({ recentIncidents: false })}
      className={cn("max-md:max-h-96", geist.className)}
      fullscreen
    >
      <DrawerHeader className="flex items-center justify-between">
        <DrawerTitle>Incidentes recientes</DrawerTitle>
        <DrawerClose asChild>
          <Button variant="ghost">
            <XIcon className="size-4 min-w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </DrawerClose>
      </DrawerHeader>
      <Separator />

      {isPending && !data ? (
        <div className="flex h-full flex-col items-center justify-center">
          <Loader2Icon className="size-4 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="flex flex-col">
          {results.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
          {hasNextPage ? (
            <Button
              variant="link"
              className="mx-auto my-4 flex items-center justify-center gap-2 text-foreground"
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage && (
                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
              )}
              Cargar más
            </Button>
          ) : (
            <p className="min-w-full py-4 text-center">No hay más incidentes.</p>
          )}
        </ScrollArea>
      )}
    </ResponsiveDrawer>
  );
}

const IncidentCard = ({ incident }: { incident: LatestIncident }) => {
  const [, setActiveIncident] = useActiveIncident();

  const handleClick = () => {
    setActiveIncident({ incidentId: incident.id, fullScreen: true });
  };

  return (
    <div
      className="flex flex-col gap-1 border-b p-4 text-xs"
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      <div className="flex items-baseline justify-between font-semibold">
        <span className="flex-1 whitespace-nowrap">
          {new Date(incident.incidentTimestamp).toLocaleString()}
        </span>
        <span className="flex-1 text-ellipsis text-end">{incident.specificIncidentType}</span>
      </div>
      <span className="line-clamp-2 text-muted-foreground">{incident.address}</span>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{incident.responsibleStation}</span>
        <span className="flex items-center gap-2 font-bold underline underline-offset-2 hover:cursor-pointer">
          Ver más <ArrowRightIcon className="size-4" />
        </span>
      </div>
    </div>
  );
};
