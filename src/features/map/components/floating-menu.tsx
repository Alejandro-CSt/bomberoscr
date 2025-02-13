"use client";

import { useMapSettings } from "@/features/map/context/map-settings-context";
import { useActiveIncident } from "@/features/map/hooks/use-active-incident";
import { useActiveStation } from "@/features/map/hooks/use-active-station";
import { useFloatingMenu } from "@/features/map/hooks/use-floating-menu";
import { cn } from "@/lib/utils";
import { SettingsIcon, SirenIcon } from "lucide-react";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"], weight: ["600"] });

export function FloatingMenu() {
  const settings = useMapSettings();
  const [floatingMenu, setFloatingMenu] = useFloatingMenu();
  const [, setActiveStation] = useActiveStation();
  const [, setActiveIncident] = useActiveIncident();

  const resetDrawers = () => {
    setActiveStation(null);
    setActiveIncident(null);
  };

  const options = [
    {
      label: "Incidentes",
      icon: SirenIcon,
      action: () => {
        setFloatingMenu({ recentIncidents: !floatingMenu.recentIncidents, options: false });
        resetDrawers();
      }
    },
    // {
    //   label: "Estadísticas",
    //   icon: LineChartIcon,
    //   action: () => console.log("Button clicked")
    // },
    {
      label: "Opciones",
      icon: SettingsIcon,
      action: () => {
        setFloatingMenu({ options: !floatingMenu.options, recentIncidents: false });
        resetDrawers();
      }
    }
  ];

  return (
    <div
      className={cn(
        "-translate-x-1/2 absolute top-4 left-1/2 z-20 flex items-center overflow-hidden rounded-xl border border-white bg-transparent backdrop-blur-md",
        geist.className,
        settings.style === "dark" && "text-white"
      )}
    >
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={option.action}
          className="flex flex-1 flex-col items-center justify-center gap-1 px-2 py-1 transition-[background-color] hover:bg-white/10 hover:backdrop-blur-2xl"
        >
          <option.icon className="size-5 min-w-5" />
          <span className="text-xs">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
