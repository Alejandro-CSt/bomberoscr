"use client";

import { Button } from "@/features/shared/components/ui/button";
import { cn } from "@/features/shared/lib/utils";
import { SearchIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingNavigation() {
  const pathname = usePathname();

  return (
    <div
      className="absolute left-4 z-10 flex items-center gap-2"
      style={{ top: "calc(var(--app-top-offset) + 0.5rem)" }}
    >
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
