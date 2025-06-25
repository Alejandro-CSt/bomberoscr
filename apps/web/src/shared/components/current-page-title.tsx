"use client";

import { destinations } from "@/shared/nav/components/sidebar";
import { usePathname } from "next/navigation";

export function CurrentPageTitle() {
  const path = usePathname();
  const activeDestination = destinations.navMain.find((item) => path.startsWith(item.url));

  return (
    <h1 className="font-medium text-base">
      {activeDestination ? activeDestination.title : "Estadísticas"}
    </h1>
  );
}
