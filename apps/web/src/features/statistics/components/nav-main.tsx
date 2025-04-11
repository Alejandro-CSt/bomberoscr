"use client";

import {
  BarChartHorizontalIcon,
  Building2Icon,
  CarIcon,
  ChartLineIcon,
  GlobeIcon,
  MapIcon,
  RefreshCcwIcon,
  ShieldIcon,
  SirenIcon
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/features/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const destinations = {
  navMain: [
    {
      title: "Inicio",
      url: "/estadisticas",
      icon: ChartLineIcon
    },
    {
      title: "Estaciones",
      url: "/estadisticas/estaciones",
      icon: Building2Icon
    },
    {
      title: "Vehículos",
      url: "/estadisticas/vehiculos",
      icon: CarIcon
    },
    {
      title: "Incidentes",
      url: "/estadisticas/incidentes",
      icon: SirenIcon
    },
    {
      title: "Despachos",
      url: "/estadisticas/despachos",
      icon: RefreshCcwIcon
    },
    {
      title: "Mapas",
      url: "/estadisticas/mapas",
      icon: MapIcon
    },
    {
      title: "Geografía",
      url: "/estadisticas/incidentes/geografia",
      icon: GlobeIcon
    },
    {
      title: "Comparativas",
      url: "/estadisticas/incidentes/comparacion",
      icon: BarChartHorizontalIcon
    }
  ],
  navFooter: [
    {
      title: "Admin",
      url: "/estadisticas/admin",
      icon: ShieldIcon
    }
  ]
};

export function NavMain() {
  const path = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Estadísticas</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {destinations.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={cn(path === item.url && "bg-sidebar-accent")}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
