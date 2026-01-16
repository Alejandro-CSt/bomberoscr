import { createFileRoute } from "@tanstack/react-router";

import { HighlightedIncidents } from "@/components/homepage/highlighted-incidents";
import { LatestIncidents } from "@/components/homepage/latest-incidents";
import { MapCTA } from "@/components/homepage/map-cta";
import { timeRangeSearchSchema } from "@/components/homepage/time-range-search-params";
import { YearRecapHero } from "@/components/homepage/year-recap-hero";

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
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <HighlightedIncidents />
      <LatestIncidents />
      <MapCTA />
      <YearRecapHero />
    </div>
  );
}
