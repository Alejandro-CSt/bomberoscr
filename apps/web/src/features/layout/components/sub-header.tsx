"use client";

import { HeaderContent } from "@/features/layout/components/subheader-content";
import { Suspense } from "react";

function SubHeaderSkeleton() {
  return (
    <header className="app-subheader flex shrink-0 items-center gap-2 bg-background px-6 py-2 xl:px-0">
      <div className="mx-auto w-full max-w-6xl">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
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
