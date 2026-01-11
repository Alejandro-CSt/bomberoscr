import { createFileRoute } from "@tanstack/react-router";

const title = "Emergencias CR";
const description =
  "Visualiza incidentes recientes, métricas operativas y estaciones de bomberos con datos en vivo.";

export const Route = createFileRoute("/_dashboard/")({
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
  component: HomePage
});

function HomePage() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
