"use client";

import { Button } from "@/features/shared/components/ui/button";
import { useSidebar } from "@/features/shared/components/ui/sidebar";
import { cn } from "@/features/shared/lib/utils";
import { MenuIcon, SearchIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingNavigation() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
      <div className="flex min-h-[40px] flex-col items-center justify-center rounded-full border bg-background/80 p-0.5 shadow-lg backdrop-blur-lg md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full transition-[background-color] duration-75 hover:bg-accent"
        >
          <MenuIcon className="size-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          asChild
          className={cn(
            "flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 shadow-lg backdrop-blur-lg transition-[background] hover:bg-accent",
            pathname.startsWith("/mapa/ajustes") ? "bg-primary text-primary-foreground" : ""
          )}
        >
          <Link prefetch href="/mapa/ajustes">
            <Settings2Icon className="size-4" />
            <span className="font-medium text-sm">Opciones</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          asChild
          className={cn(
            "flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 shadow-lg backdrop-blur-lg transition-[background] hover:bg-accent",
            pathname.startsWith("/mapa/busqueda") ? "bg-primary text-primary-foreground" : ""
          )}
        >
          <Link prefetch href="/mapa/busqueda">
            <SearchIcon className="size-4" />
            <span className="font-medium text-sm">Buscar</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
