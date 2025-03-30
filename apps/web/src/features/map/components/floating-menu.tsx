"use client";

import { useMediaQuery } from "@/features/hooks/use-media-query";
import { PanelView, useDynamicPanel } from "@/features/map/hooks/use-dynamic-panel";
import { cn } from "@/lib/utils";
import { BarChart2Icon, Settings2Icon, SirenIcon } from "lucide-react";
import { motion } from "motion/react";

const menuItems = [
  {
    id: PanelView.Incidents,
    name: "Incidentes",
    icon: SirenIcon
  },
  {
    id: PanelView.Statistics,
    name: "Estadísticas",
    icon: BarChart2Icon
  },
  {
    id: PanelView.Options,
    name: "Opciones",
    icon: Settings2Icon
  }
];

export default function FloatingMenu() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [panelState, setPanelState] = useDynamicPanel();

  return (
    <div className="max-md:-translate-x-1/2 absolute top-4 left-1/2 z-10 md:top-6 md:left-8">
      <motion.div
        key="main-menu"
        initial={{ opacity: 0, y: isMobile ? 20 : -20 }}
        animate={{ opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.3 } }}
        className="flex gap-2 rounded-full border bg-background/80 px-2 py-1 opacity-75 shadow-lg backdrop-blur-lg"
      >
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => {
              const newView = panelState.view === item.id ? null : item.id;
              setPanelState({
                view: newView,
                title: newView ? item.name : null
              });
            }}
            className={cn(
              "flex items-center justify-center gap-4 rounded-full px-4 py-1 transition-colors duration-300",
              panelState.view === item.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/40 text-secondary-foreground hover:bg-secondary/60"
            )}
            layout
            transition={{
              layout: { duration: 0.4 }
            }}
          >
            <item.icon className="size-5 md:size-6" />
            <span className="sr-only">{item.name}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
