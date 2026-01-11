import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/estaciones/")({
  component: EstacionesPage
});

function EstacionesPage() {
  return (
    <div>
      <h1>Estaciones</h1>
    </div>
  );
}
