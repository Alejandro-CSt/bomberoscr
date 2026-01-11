import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mapa")({
  component: MapaPage
});

function MapaPage() {
  return (
    <div>
      <h1>Mapa</h1>
    </div>
  );
}
