"use client";

import ThemeToggle from "@/shared/components/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { MapIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-12 items-center justify-between gap-4">
        {/* <SidebarTrigger className={cn(open && "hidden", isMobile && "block")} /> */}
        <div className="grow max-sm:hidden">
          <div className="relative w-full max-w-xs">
            <Input className="peer h-8 ps-8" placeholder="Buscar..." type="search" />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/80 peer-disabled:opacity-50">
              <SearchIcon size={16} />
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild size="sm" className="text-sm">
            <Link href="/mapa">
              <MapIcon className="size-4" />
              Mapa
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
