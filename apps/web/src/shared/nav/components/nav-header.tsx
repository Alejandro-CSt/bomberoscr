"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { SidebarHeader, useSidebar } from "@/shared/components/ui/sidebar";
import { ArrowLeftToLineIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function NavHeader() {
  const { open, setOpen } = useSidebar();

  return (
    <SidebarHeader>
      <div className="flex items-center justify-between gap-2">
        <Link href="/">
          <Image src="/alarm-3d.png" height={48} width={48} alt="Logo" />
        </Link>
        <Button
          size="icon"
          variant="ghost"
          className={cn(!open && "hidden")}
          onClick={() => setOpen(false)}
        >
          <ArrowLeftToLineIcon />
        </Button>
      </div>
    </SidebarHeader>
  );
}
