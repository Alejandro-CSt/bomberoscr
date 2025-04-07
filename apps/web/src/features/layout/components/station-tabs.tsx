"use client";

import { cn } from "@/lib/utils";
import { ChartSplineIcon, SirenIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function StationTabs({ name }: { name: string }) {
  const path = decodeURIComponent(usePathname());

  const tabs = [
    {
      href: `/estaciones/${name}`,
      label: "Incidentes",
      icon: <SirenIcon className="size-4" />
    },
    {
      href: `/estaciones/${name}/estadisticas`,
      label: "Estadísticas",
      icon: <ChartSplineIcon className="size-4" />
    }
  ];

  return (
    <div className="sticky top-[60px] z-50 bg-background py-2 backdrop-blur-md">
      <div className="flex w-full items-center justify-between">
        {tabs.map((tab) => (
          <Link
            href={tab.href}
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
