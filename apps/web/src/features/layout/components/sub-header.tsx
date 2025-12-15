"use client";

import { HeaderContent } from "@/features/layout/components/subheader-content";
import { Suspense } from "react";

function SubHeaderSkeleton() {
  return (
    <header className="app-subheader flex shrink-0 items-center gap-2 bg-background py-2">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
    </header>
  );
}

export function SubHeader() {
  return (
    <Suspense fallback={<SubHeaderSkeleton />}>
      <HeaderContent />
    </Suspense>
  );
}
