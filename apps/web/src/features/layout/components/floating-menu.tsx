"use client";

import { useMediaQuery } from "@/features/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Settings2Icon, SirenIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    id: "incidentes",
    name: "Incidentes",
    icon: SirenIcon,
    href: "/incidentes"
  },
  // {
  //   id: PanelView.Statistics,
  //   name: "Estaciones",
  //   icon: Warehouse,
  //   href: "/estaciones"
  // },
  {
    id: "opciones",
    name: "Opciones",
    icon: Settings2Icon,
    href: "/ajustes"
  }
];

export default function FloatingMenu() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();

  return (
    <div className="max-md:-translate-x-1/2 absolute top-4 left-1/2 z-10 md:top-6 md:left-8">
      <motion.div
        key="main-menu"
        initial={{ opacity: 0, y: isMobile ? 20 : -20 }}
        animate={{ opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.3 } }}
        className="flex gap-2 rounded-full border bg-background/80 px-2 py-1 opacity-75 shadow-lg backdrop-blur-lg"
      >
        {menuItems.map((item) => (
          <Link
            prefetch
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center justify-center gap-4 rounded-full px-4 py-1 transition-colors duration-300",
              pathname.startsWith(item.href)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/40 text-secondary-foreground hover:bg-secondary/60"
            )}
          >
            <item.icon className="size-5 md:size-6" />
            <span className="sr-only">{item.name}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
