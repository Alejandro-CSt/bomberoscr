import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Footer } from "@/components/layout/footer";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout
});

function DashboardLayout() {
  return (
    <>
      <div className="mx-auto min-h-[calc(100dvh-var(--app-header-height))] max-w-6xl px-6 pt-12 xl:px-0">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
