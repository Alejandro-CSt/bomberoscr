import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_map")({
  component: MapLayout
});

function MapLayout() {
  return <Outlet />;
}
