import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/incidentes/$slug")({
  component: IncidenteDetailPage
});

function IncidenteDetailPage() {
  const { slug } = Route.useParams();
  return (
    <div>
      <h1>Incidente: {slug}</h1>
    </div>
  );
}
