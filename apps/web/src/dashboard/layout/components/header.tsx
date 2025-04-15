"use client";

import { destinations } from "@/dashboard/layout/components/sidebar";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { MapIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function StatisticsHeader() {
  const path = usePathname();
  const activeDestination = destinations.navMain.find((item) => path.startsWith(item.url));

  return (
    <header className="sticky top-0 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-xl border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="font-medium text-base">
          {activeDestination ? activeDestination.title : "Default Title"}
        </h1>
      </div>
      <Button asChild className="me-2 md:m-4 md:me-4">
        <Link href="/" className="flex items-center gap-1">
          <MapIcon className="size-4" />
          Volver al mapa
        </Link>
      </Button>
    </header>
  );
}
