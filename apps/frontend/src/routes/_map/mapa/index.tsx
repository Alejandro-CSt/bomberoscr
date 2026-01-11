import { createFileRoute } from "@tanstack/react-router";

const title = "Mapa de Emergencias — Emergencias CR";
const description =
  "Visualiza el mapa interactivo con incidentes activos, historial, estaciones y tiempos de respuesta de Bomberos de Costa Rica en tiempo real.";

export const Route = createFileRoute("/_map/mapa/")({
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
  component: MapaPage
});

function MapaPage() {
  return (
    <div>
      <h1>Mapa</h1>
    </div>
  );
}
