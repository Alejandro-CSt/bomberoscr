import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/incidentes/")({ component: IncidentesPage });

function IncidentesPage() {
  return (
    <div>
      <h1>Incidentes</h1>
    </div>
  );
}
