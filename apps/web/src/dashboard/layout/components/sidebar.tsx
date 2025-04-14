import { NavFooter } from "@/dashboard/layout/components/nav-footer";
import { NavMain } from "@/dashboard/layout/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from "@/shared/components/ui/sidebar";
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
import type * as React from "react";

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <NavFooter />
      <SidebarRail />
    </Sidebar>
  );
}
