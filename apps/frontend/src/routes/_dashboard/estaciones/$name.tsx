import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/estaciones/$name")({
  head: ({ params }) => {
    const stationName = decodeURIComponent(params.name).replace(/-/g, " ");
    const title = `Estación ${stationName} — Emergencias CR`;
    const description = `Detalles y estadísticas de incidentes atendidos por la estación de ${stationName}.`;
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
  component: EstacionDetailPage
});

function EstacionDetailPage() {
  const { name } = Route.useParams();
  return (
    <div>
      <h1>Estacion: {name}</h1>
    </div>
  );
}
