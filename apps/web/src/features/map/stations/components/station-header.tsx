"use client";

import { cn } from "@/features/shared/lib/utils";
import { ChartSplineIcon, SirenIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface StationHeader {
  station: {
    stationKey: string;
    name: string;
    address?: string;
  };
}

export function StationHeader({ station }: StationHeader) {
  const path = decodeURIComponent(usePathname());

  const tabs = [
    {
      href: `/mapa/estaciones/${station.name}`,
      label: "Incidentes",
      icon: <SirenIcon className="size-4" />
    },
    {
      href: `/mapa/estaciones/${station.name}/estadisticas`,
      label: "Estadísticas",
      icon: <ChartSplineIcon className="size-4" />
    }
  ];

  return (
    <div className="border-b">
      <div className="flex items-center gap-4 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center truncate rounded-full bg-orange-100 font-bold text-orange-500">
          {station.stationKey}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-bold text-lg">{station.name}</h2>

          <div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
            {station.address && <span className="line-clamp-2 text-wrap">{station.address}</span>}
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-between bg-card py-2">
        {tabs.map((tab) => (
          <Link
            href={{ pathname: tab.href }}
            key={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 px-4 py-2 transition-colors duration-200",
              path === tab.href
                ? "text-primary"
                : "text-muted-foreground hover:text-muted-foreground/80"
            )}
          >
            {tab.icon}
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
