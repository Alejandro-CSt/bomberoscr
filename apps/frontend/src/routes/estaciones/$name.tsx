import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/estaciones/$name")({
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
