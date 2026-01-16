import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { HighlightedIncidents } from "@/components/homepage/highlighted-incidents";
import { IncidentDistributionCharts } from "@/components/homepage/incident-distribution-charts";
import { LatestIncidents } from "@/components/homepage/latest-incidents";
import { MapCTA } from "@/components/homepage/map-cta";
import { timeRangeSearchSchema } from "@/components/homepage/time-range-search-params";
import { TopStationsCharts } from "@/components/homepage/top-stations-charts";
import { YearRecapHero } from "@/components/homepage/year-recap-hero";
import { Skeleton } from "@/components/ui/skeleton";

const ParticlesMap = lazy(() => import("@/components/homepage/particles-map"));

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
    <div className="flex flex-col gap-8">
      <HighlightedIncidents />
      <LatestIncidents />
      <MapCTA />
      <YearRecapHero />
      <TopStationsCharts />
      <IncidentDistributionCharts />
      <Suspense
        fallback={
          <div className="flex w-full items-center justify-center p-8">
            <Skeleton className="aspect-square w-full max-w-[600px]" />
          </div>
        }>
        <ParticlesMap />
      </Suspense>
    </div>
  );
}
