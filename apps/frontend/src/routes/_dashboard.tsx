import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/layout/footer";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout
});

function DashboardLayout() {
  return (
    <>
      <div className="min-h-[calc(100dvh-var(--app-header-height))]">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
