"use client";

import { Badge } from "@/features/components/ui/badge";
import { Button } from "@/features/components/ui/button";
import {
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/features/components/ui/drawer";
import { Separator } from "@/features/components/ui/separator";
import { Skeleton } from "@/features/components/ui/skeleton";
import { useMediaQuery } from "@/features/hooks/use-media-query";
import { ResponsiveDrawer } from "@/features/map/components/responsive-drawer";
import { useActiveIncident } from "@/features/map/hooks/use-active-incident";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { Incident } from "@/server/trpc";
import { BellPlusIcon, LoaderIcon, ShareIcon, SirenIcon, XIcon } from "lucide-react";
import { Geist_Mono } from "next/font/google";

const geist = Geist_Mono({ weight: "variable", subsets: ["latin"] });

export default function IncidentInfoDrawer() {
  const [activeIncident, setActiveIncident] = useActiveIncident();
  const isOpen = activeIncident.incidentId !== null && !activeIncident.fullScreen;
  const { data: incident, isPending } = trpc.incidents.getIncidentById.useQuery({
    id: activeIncident.incidentId || undefined
  });
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const handleClose = () => {
    setActiveIncident(null);
  };

  return (
    <ResponsiveDrawer
      isOpen={isOpen}
      onClose={handleClose}
      fullscreen={false}
      className={cn(isDesktop ? "max-h-[calc(100dvh-16px)]" : "max-h-72")}
    >
      <IncidentDrawerHeader
        {...createHeaderProps(isPending, incident?.id, incident?.EEConsecutive, incident?.isOpen)}
      />
      <Separator />
      {isPending ? (
        <div className="flex flex-1 grow items-center justify-center">
          <LoaderIcon className="size-4 min-w-4 animate-spin" />
        </div>
      ) : (
        <IncidentDrawerBody incident={incident} />
      )}
      <Separator />
      <IncidentDrawerFooter />
    </ResponsiveDrawer>
  );
}

type IncidentDrawerHeaderProps = {
  isPending: boolean;
} & (
  | {
      isPending: true;
      id?: undefined;
      eeConsecutive?: undefined;
      isOpen?: undefined;
    }
  | {
      isPending: false;
      id: number;
      eeConsecutive: string;
      isOpen: boolean;
    }
);

export const createHeaderProps = (
  isPending: boolean,
  id: number | undefined,
  eeConsecutive: string | undefined,
  isOpen: boolean | undefined
): IncidentDrawerHeaderProps => {
  if (isPending || id === undefined || eeConsecutive === undefined || isOpen === undefined) {
    return { isPending: true };
  }
  return {
    isPending: false,
    id: id,
    eeConsecutive: eeConsecutive,
    isOpen: isOpen
  };
};

export const IncidentDrawerHeader = ({
  id,
  eeConsecutive,
  isOpen,
  isPending
}: IncidentDrawerHeaderProps) => {
  return (
    <DrawerHeader className={cn("flex items-center justify-between px-2 py-1", geist.className)}>
      <div className="flex w-full items-center justify-between gap-4">
        {isPending ? (
          <>
            <DrawerTitle className="sr-only">Cargando...</DrawerTitle>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-20" />
          </>
        ) : (
          <div className="flex flex-col items-start gap-1">
            <DrawerTitle className="font-semibold text-lg">EE {eeConsecutive}</DrawerTitle>
          </div>
        )}
        {!isPending && (
          <Badge variant={isOpen ? "destructive" : "secondary"} className="rounded-full px-3">
            #{id}
          </Badge>
        )}
      </div>
      <DrawerClose asChild>
        <Button variant="ghost">
          <XIcon size={20} />
        </Button>
      </DrawerClose>
    </DrawerHeader>
  );
};

const IncidentDrawerBody = ({ incident }: { incident: Incident | null }) => {
  return (
    <div className={cn("h-full flex-grow overflow-y-scroll", geist.className)}>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-8 border-b">
          <div className="col-span-6 grid grid-cols-2 gap-2 border-r px-2 pt-2 text-xs">
            <p className="col-span-full flex flex-col gap-1 text-muted-foreground">
              Detalles
              <span className="font-semibold text-foreground">{incident?.importantDetails}</span>
            </p>
            <p className="flex flex-col gap-1 text-muted-foreground">
              Aviso
              <span className="font-semibold text-foreground">
                {incident?.incidentTimestamp &&
                  new Date(incident?.incidentTimestamp).toLocaleString()}
              </span>
            </p>
            <p className="flex flex-col gap-1 text-muted-foreground">
              Estación responsable
              <span className="font-semibold text-foreground">{incident?.responsibleStation}</span>
            </p>
          </div>
          <div className="col-span-2 flex flex-col gap-4 p-2 text-xs">
            <h3 className="justify-self-start">Atienden</h3>
            <div className="flex min-w-full flex-col gap-1">
              <p className="flex flex-col">
                <span className="text-muted-foreground">Estaciones</span>
                {incident?.dispatchedStationsCount}
              </p>
              <p className="flex flex-col">
                <span className="text-muted-foreground">Unidades</span>
                {incident?.dispatchesVehiclesCount}
              </p>
            </div>
          </div>
        </div>
        <span className="px-2 pb-1 text-xs">{incident?.address || "Sin dirección"}</span>
      </div>
    </div>
  );
};

export const IncidentDrawerFooter = ({ hideDetailsButton }: { hideDetailsButton?: boolean }) => {
  const [activeIncident, setActiveIncident] = useActiveIncident();

  return (
    <DrawerFooter className={cn("mt-0 flex flex-row p-0 text-xs", geist.className)}>
      {!hideDetailsButton && (
        <>
          <button
            className="flex flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap px-2 py-1"
            type="button"
            onClick={() => setActiveIncident({ fullScreen: !activeIncident.fullScreen })}
          >
            <SirenIcon className="size-4 min-h-4 min-w-4" />
            Detalles
          </button>
          <Separator orientation="vertical" />
        </>
      )}
      <button
        type="button"
        className="flex flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap px-2 py-1"
      >
        <BellPlusIcon className="size-4 min-h-4 min-w-4" />
        Seguir
      </button>
      <Separator orientation="vertical" />
      <button
        type="button"
        className="flex flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap px-2 py-1"
      >
        <ShareIcon className="size-4 min-w-4" />
        Compartir
      </button>
    </DrawerFooter>
  );
};
