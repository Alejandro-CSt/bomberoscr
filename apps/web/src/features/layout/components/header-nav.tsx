"use client";

import { navItems } from "@/features/layout/components/nav-items";
import { Tabs, TabsList, TabsTab } from "@/features/shared/components/ui/tabs";
import { cn } from "@/features/shared/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const enabledNavItems = navItems.filter((item) => item.enabled);

function HeaderNavInner({ className }: { className?: string }) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === "/") {
      return "inicio";
    }
    if (pathname.includes("/mapa")) {
      return "mapa";
    }
    if (pathname.includes("/incidentes")) {
      return "incidentes";
    }
    if (pathname.includes("/estaciones")) {
      return "estaciones";
    }
    return "inicio";
  };

  return (
    <Tabs className={cn("py-2", className)} value={getActiveTab()}>
      <div>
        <TabsList
          variant="underline"
          className="h-auto gap-0 rounded-none bg-transparent px-1 py-1 text-foreground outline-none *:shrink-0 focus:outline-none focus-visible:outline-none"
        >
          {enabledNavItems.map((item) => {
            const value = item.title
              .toLowerCase()
              .replace(" ", "-")
              .replace("mapa-interactivo", "mapa");
            const Icon = item.icon;
            const tabValue = value === "mapa-interactivo" ? "mapa" : value;
            return (
              <TabsTab
                className="relative border-none hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-active:bg-transparent data-active:shadow-none data-active:hover:bg-accent"
                key={item.url}
                render={
                  <Link
                    href={item.url as "/"}
                    prefetch={item.url !== "/mapa" && item.url !== "/"}
                  />
                }
                nativeButton={false}
                value={tabValue}
              >
                <Icon size={16} />
                {item.title}
              </TabsTab>
            );
          })}
        </TabsList>
      </div>
    </Tabs>
  );
}

export function HeaderNav({ className }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <HeaderNavInner className={className} />
    </Suspense>
  );
}
