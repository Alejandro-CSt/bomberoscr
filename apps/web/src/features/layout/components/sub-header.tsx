"use client";

import { HeaderContent } from "@/features/layout/components/header-content";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

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

  if (pathname === "/" || pathname.startsWith("/mapa")) {
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
