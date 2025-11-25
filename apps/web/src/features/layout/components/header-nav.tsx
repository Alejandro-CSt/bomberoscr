"use client";

import { navItems } from "@/features/layout/components/nav-items";
import { Tabs, TabsList, TabsTrigger } from "@/features/shared/components/ui/tabs";
import { cn } from "@/features/shared/lib/utils";
import { motion } from "motion/react";
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
      <TabsList className="h-auto gap-0 rounded-none bg-transparent px-1 py-1 text-foreground *:flex-shrink-0 [&_[data-slot=tab-indicator]]:hidden">
        {enabledNavItems.map((item) => {
          const value = item.title
            .toLowerCase()
            .replace(" ", "-")
            .replace("mapa-interactivo", "mapa");
          const Icon = item.icon;
          const tabValue = value === "mapa-interactivo" ? "mapa" : value;
          return (
            <TabsTrigger
              className="relative border-none hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent"
              key={item.url}
              render={<Link href={item.url as "/"} />}
              value={tabValue}
            >
              <Icon size={16} />
              {item.title}
              {getActiveTab() === tabValue && (
                <motion.div
                  className="-bottom-1 absolute left-0 h-0.5 w-full bg-primary"
                  initial={false}
                  layoutId="active-tab-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
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
