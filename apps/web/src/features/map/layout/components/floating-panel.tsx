"use client";

import { useMediaQuery } from "@/features/shared/hooks/use-media-query";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface FloatingPanelContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setHeaderHeight: (h: number) => void;
  headerHeight: number | null;
  isMobile: boolean;
}

const FloatingPanelContext = React.createContext<FloatingPanelContextValue | null>(null);

export function useFloatingPanel() {
  const ctx = React.useContext(FloatingPanelContext);
  if (!ctx) {
    throw new Error("useFloatingPanel must be used within <FloatingPanel>");
  }
  return ctx;
}

export function FloatingPanel({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    void pathname;
    setCollapsed(false);
  }, [pathname]);

  useEffect(() => {
    if (isInitialLoad) setIsInitialLoad(false);
  }, [isInitialLoad]);

  const toggleCollapsed = useCallback(() => {
    if (!isMobile) return;
    setCollapsed((c) => !c);
  }, [isMobile]);

  const ctx: FloatingPanelContextValue = useMemo(
    () => ({ collapsed, toggleCollapsed, setHeaderHeight, headerHeight, isMobile }),
    [collapsed, toggleCollapsed, headerHeight, isMobile]
  );

  const mobileY = collapsed ? (headerHeight ? `calc(100% - ${headerHeight}px)` : "100%") : 0;

  return (
    <AnimatePresence mode="sync">
      {pathname !== "/mapa" && (
        <FloatingPanelContext.Provider value={ctx}>
          <motion.div
            className="fixed top-20 bottom-0 z-50 max-h-dvh w-full overflow-hidden rounded-xl border bg-card shadow-xl max-md:rounded-b-none md:top-4 md:right-4 md:bottom-4 md:w-[450px] md:max-w-[calc(100vw-32px)]"
            style={isMobile ? { touchAction: "none" } : undefined}
            initial={isInitialLoad ? false : isMobile ? { y: "100%" } : { x: "110%" }}
            animate={isMobile ? { y: mobileY } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "110%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </FloatingPanelContext.Provider>
      )}
    </AnimatePresence>
  );
}
