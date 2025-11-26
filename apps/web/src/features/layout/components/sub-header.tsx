"use client";

import { HeaderContent } from "@/features/layout/components/header-content";
import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";

function SubHeaderSkeleton() {
  return (
    <header className="app-subheader flex shrink-0 items-center gap-2 bg-background px-4 py-2">
      <div className="mx-auto w-full max-w-4xl">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
    </header>
  );
}

function SubHeaderInner() {
  const pathname = usePathname();
  const shouldHideSubheader = pathname === "/" || pathname.startsWith("/mapa");

  useEffect(() => {
    // Conditionally add/remove the no-subheader class to adjust CSS variable
    if (shouldHideSubheader) {
      document.body.classList.add("no-subheader");
    } else {
      document.body.classList.remove("no-subheader");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("no-subheader");
    };
  }, [shouldHideSubheader]);

  if (shouldHideSubheader) {
    return null;
  }

  return <HeaderContent />;
}

export function SubHeader() {
  return (
    <Suspense fallback={<SubHeaderSkeleton />}>
      <SubHeaderInner />
    </Suspense>
  );
}
