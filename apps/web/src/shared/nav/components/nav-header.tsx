"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { SidebarHeader, useSidebar } from "@/shared/components/ui/sidebar";
import { ArrowLeftToLineIcon, FireExtinguisherIcon } from "lucide-react";
import Link from "next/link";

export function NavHeader() {
  const { open, setOpen } = useSidebar();

  return (
    <SidebarHeader>
      <div className="flex items-center justify-between gap-2">
        <Link href="/">
          <FireExtinguisherIcon className="size-8" />
        </Link>
        <Button
          size="icon"
          variant="ghost"
          className={cn(!open && "hidden", "max-md:hidden")}
          onClick={() => setOpen(false)}
        >
          <ArrowLeftToLineIcon />
        </Button>
      </div>
    </SidebarHeader>
  );
}
