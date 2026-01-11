import { createFileRoute } from "@tanstack/react-router";

const title = "Estaciones de Bomberos — Emergencias CR";
const description =
  "Consulta el directorio de estaciones de bomberos de Costa Rica, con datos de ubicación, unidades y estadísticas de respuesta.";

export const Route = createFileRoute("/_dashboard/estaciones/")({
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
  component: EstacionesPage
});

function EstacionesPage() {
  return (
    <div>
      <h1>Estaciones</h1>
    </div>
  );
}
