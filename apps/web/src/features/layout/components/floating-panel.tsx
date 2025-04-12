"use client";

import { useMediaQuery } from "@/features/hooks/use-media-query";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function FloatingPanel({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  return (
    <AnimatePresence mode="sync">
      {pathname !== "/" && (
        <motion.div
          className="fixed top-20 bottom-0 z-50 max-h-dvh w-full overflow-hidden rounded-xl border bg-card shadow-xl max-md:rounded-b-none md:bottom-4 md:left-8 md:w-[450px] md:max-w-[calc(100vw-32px)]"
          initial={isInitialLoad ? false : isMobile ? { y: "100%" } : { x: "-110%" }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: "100%" } : { x: "-110%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
