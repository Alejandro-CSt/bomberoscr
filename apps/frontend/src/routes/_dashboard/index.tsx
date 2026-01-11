import { createFileRoute } from "@tanstack/react-router";

import { HighlightedIncidents } from "@/components/homepage/highlighted-incidents";
import { timeRangeSearchSchema } from "@/components/homepage/time-range-search-params";

const title = "Emergencias CR";
const description =
  "Visualiza incidentes recientes, métricas operativas y estaciones de bomberos con datos en vivo.";

export const Route = createFileRoute("/_dashboard/")({
  validateSearch: timeRangeSearchSchema,
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
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HighlightedIncidents />
    </div>
  );
}
