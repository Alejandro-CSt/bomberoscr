import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/incidentes/$slug")({
  head: ({ params }) => {
    const title = `Incidente ${params.slug} — Emergencias CR`;
    const description = `Detalles del incidente ${params.slug} atendido por Bomberos de Costa Rica.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description }
      ]
    };
  },
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
