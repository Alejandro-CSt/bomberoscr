"use client";

import { Button } from "@/features/components/ui/button";
import {
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/features/components/ui/drawer";
import { Separator } from "@/features/components/ui/separator";
import { ResponsiveDrawer } from "@/features/map/components/responsive-drawer";
import { StationKeyDisplay } from "@/features/map/components/station-key-display";
import { cn } from "@/lib/utils";
import { Building2Icon, ChartSplineIcon, SirenIcon, XIcon } from "lucide-react";
import { Geist_Mono } from "next/font/google";
import { TabName, useActiveStation } from "../hooks/use-station";

const geist = Geist_Mono({ subsets: ["latin"], weight: "variable" });

export default function StationInfoDrawer() {
  const [activeStationQuery, setActiveStation] = useActiveStation();

  const handleClose = () => {
    setActiveStation(null);
  };

  return (
    <ResponsiveDrawer
      isOpen={
        activeStationQuery.stationKey !== null &&
        activeStationQuery.stationName !== null &&
        !activeStationQuery.fullScreen
      }
      onClose={handleClose}
    >
      <div className="flex h-full flex-col justify-between gap-1">
        <StationDrawerHeader />
        <Separator />
        <StationDrawerFooter />
      </div>
    </ResponsiveDrawer>
  );
}

export function StationDrawerHeader() {
  const [activeStationQuery] = useActiveStation();

  return (
    <DrawerHeader className={cn("flex items-center justify-between px-4 py-2", geist.className)}>
      <div className="flex items-center gap-2">
        <StationKeyDisplay stationKey={activeStationQuery.stationKey || "0-0"} />
        <DrawerTitle>{activeStationQuery.stationName}</DrawerTitle>
      </div>
      <DrawerClose asChild>
        <Button variant="ghost">
          <XIcon size={20} />
        </Button>
      </DrawerClose>
    </DrawerHeader>
  );
}

export function StationDrawerFooter() {
  const [activeStation, setActiveStation] = useActiveStation();

  return (
    <DrawerFooter className="flex flex-row justify-evenly text-sm">
      <Button
        onClick={() => {
          setActiveStation({
            fullScreen: true,
            tab: TabName.Details
          });
        }}
        className={cn(
          "flex basis-0 flex-col items-center gap-1 text-foreground",
          activeStation.tab === TabName.Details && "text-primary"
        )}
        variant="link"
      >
        <Building2Icon className="size-4" />
        General
      </Button>
      <Button
        onClick={() => {
          setActiveStation({
            fullScreen: true,
            tab: TabName.Incidents
          });
        }}
        className={cn(
          "flex basis-0 flex-col items-center gap-1 text-foreground",
          activeStation.tab === TabName.Incidents && "text-primary"
        )}
        variant="link"
      >
        <SirenIcon className="size-4" />
        Incidentes
      </Button>
      <Button
        onClick={() => {
          setActiveStation({
            fullScreen: true,
            tab: TabName.Stats
          });
        }}
        className={cn(
          "flex basis-0 flex-col items-center gap-1 text-foreground",
          activeStation.tab === TabName.Stats && "text-primary"
        )}
        variant="link"
      >
        <ChartSplineIcon className="size-4" />
        Estadísticas
      </Button>
    </DrawerFooter>
  );
}
