"use client";

import ThemeToggle from "@/features/layout/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/features/shared/components/ui/sidebar";
import { cn } from "@/features/shared/lib/utils";
import {
  FireTruckIcon,
  GarageIcon,
  HouseLineIcon,
  MapTrifoldIcon,
  SirenIcon
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  {
    title: "Inicio",
    url: "/",
    icon: HouseLineIcon,
    enabled: true
  },
  {
    title: "Mapa interactivo",
    url: "/mapa",
    icon: MapTrifoldIcon,
    enabled: true
  },
  {
    title: "Incidentes",
    url: "/incidentes",
    icon: SirenIcon,
    enabled: true
  },
  {
    title: "Estaciones",
    url: "/estaciones",
    icon: GarageIcon,
    enabled: false
  }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isActive = (item: (typeof navItems)[number]): boolean =>
    item.url === "/" ? pathname === "/" : pathname !== "/" && pathname.startsWith(item.url);

  return (
    <Sidebar collapsible="icon" side="left" variant="inset" {...props}>
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
      <SidebarContent className="md:justify-center">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title as string}>
                  <SidebarMenuButton
                    asChild
                    tooltip={{
                      children: item.title,
                      hidden: !item.enabled
                    }}
                    isActive={isActive(item)}
                    disabled={!item.enabled}
                    className={cn(!item.enabled && "select-none opacity-30")}
                  >
                    {item.enabled ? (
                      <Link href={{ pathname: item.url }}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
  );
}
