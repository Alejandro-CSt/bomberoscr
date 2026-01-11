import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/incidentes/")({
  component: IncidentesPage
});

function IncidentesPage() {
  return (
    <div>
      <h1>Incidentes</h1>
    </div>
  );
}
