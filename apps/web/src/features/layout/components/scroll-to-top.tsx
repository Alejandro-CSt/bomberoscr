"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function ScrollToTopInner() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip scroll on first render (initial page load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  );
}
