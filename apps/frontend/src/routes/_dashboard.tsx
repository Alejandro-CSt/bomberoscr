import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/layout/footer";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout
});

function DashboardLayout() {
  return (
    <>
      <div className="min-h-[calc(100dvh-var(--app-header-height))] px-6 xl:px-0">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
