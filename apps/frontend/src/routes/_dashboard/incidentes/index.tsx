import { createFileRoute } from "@tanstack/react-router";

const title = "Incidentes — Emergencias CR";
const description =
  "Consulta el historial de incidentes atendidos por Bomberos de Costa Rica. Filtra por fecha, tipo y estación.";

export const Route = createFileRoute("/_dashboard/incidentes/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description }
    ]
  }),
  component: IncidentesPage
});

function IncidentesPage() {
  return (
    <div>
      <h1>Incidentes</h1>
    </div>
  );
}
