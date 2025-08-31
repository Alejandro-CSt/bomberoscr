"use client";

import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldStartOpen = pathname !== "/incidentes";

  return (
    <SidebarProvider
      defaultOpen={shouldStartOpen}
      style={
        {
          "--sidebar-width": "350px"
        } as React.CSSProperties
      }
    >
      {children}
    </SidebarProvider>
  );
}
