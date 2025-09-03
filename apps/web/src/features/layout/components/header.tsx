import { HeaderContent } from "@/features/layout/components/header-content";
import { Suspense } from "react";

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background p-4">
      <div className="h-6 w-20 animate-pulse rounded bg-muted" />
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent />
    </Suspense>
  );
}
