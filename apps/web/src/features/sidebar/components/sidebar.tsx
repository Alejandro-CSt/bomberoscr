"use client";

import { MapIcon, SearchIcon } from "lucide-react";

import ThemeToggle from "@/features/layout/components/theme-toggle";
import { LatestIncidentsSidebar } from "@/features/sidebar/components/latest-incidents-sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/shared/components/ui/sidebar";
import { FireTruckIcon, FlameIcon, GarageIcon, HouseIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const navItems = [
  {
    title: "Inicio",
    url: "/",
    icon: HouseIcon
  },
  {
    title: "Incidentes",
    url: "/incidentes",
    icon: FlameIcon
  },
  {
    title: "Estaciones",
    url: "/estaciones",
    icon: GarageIcon
  },
  {
    title: "Búsqueda",
    url: "/busqueda",
    icon: SearchIcon
  }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen, open } = useSidebar();
  const pathname = usePathname();
  const activeItem = navItems.find((item) => item.url === pathname);
  const previousPathname = useRef(pathname);
  const userManuallyOpened = useRef(false);

  useEffect(() => {
    const isNavigatingToIncidentes =
      pathname === "/incidentes" && previousPathname.current !== "/incidentes";
    const isNavigatingAwayFromIncidentes =
      previousPathname.current === "/incidentes" && pathname !== "/incidentes";

    const isNavigatingToMapa =
      pathname.startsWith("/mapa") && !previousPathname.current.startsWith("/mapa");
    const isNavigatingAwayFromMapa =
      previousPathname.current.startsWith("/mapa") && !pathname.startsWith("/mapa");

    if (isNavigatingToIncidentes || isNavigatingToMapa) {
      userManuallyOpened.current = false;
      setOpen(false);
      previousPathname.current = pathname;
      return;
    }

    if (isNavigatingAwayFromIncidentes || isNavigatingAwayFromMapa) {
      userManuallyOpened.current = false;
      setOpen(true);
      previousPathname.current = pathname;
      return;
    }

    if (
      (pathname === "/incidentes" || pathname.startsWith("/mapa")) &&
      open &&
      !userManuallyOpened.current
    ) {
      userManuallyOpened.current = true;
      previousPathname.current = pathname;
      return;
    }

    previousPathname.current = pathname;
  }, [pathname, open, setOpen]);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-red-600/80 text-sidebar-primary-foreground">
                    <FireTruckIcon className="size-4" weight="fill" />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={{
                        children: item.title,
                        hidden: false
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
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
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={{
                      children: "Mapa interactivo",
                      hidden: false
                    }}
                    isActive={pathname.startsWith("/mapa")}
                    className="px-2.5 md:px-2"
                  >
                    <Link href="/mapa">
                      <MapIcon className="size-4" />
                      <span>Mapa interactivo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <ThemeToggle />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <LatestIncidentsSidebar />
    </Sidebar>
  );
}
