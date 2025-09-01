"use client";

import { Button } from "@/shared/components/ui/button";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { MenuIcon } from "lucide-react";

export function FloatingSidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="absolute top-6 left-6 z-10 block md:hidden">
      <div className="flex flex-col items-center rounded-full border bg-background/80 p-0.5 shadow-lg backdrop-blur-lg">
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
    </div>
  );
}
