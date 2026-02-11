import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { z } from "zod";

import { HighlightedIncidents } from "@/components/homepage/highlighted-incidents";
import { IncidentTypesChart } from "@/components/homepage/incident-types-chart";
import { LatestIncidents } from "@/components/homepage/latest-incidents";
import { MapCTA } from "@/components/homepage/map-cta";
import { YearRecapHero } from "@/components/homepage/year-recap-hero";
import { Skeleton } from "@/components/ui/skeleton";

const ParticlesMap = lazy(() => import("@/components/homepage/particles-map"));

const title = "Emergencias CR";
const description =
  "Visualiza incidentes recientes, métricas operativas y estaciones de bomberos con datos en vivo.";

export const ALLOWED_TIME_RANGE_VALUES = [7, 30, 90, 365] as const;
export const DEFAULT_TIME_RANGE = 30;

export const TIME_RANGE_LABELS = {
  7: "7 días",
  30: "1 mes",
  90: "3 meses",
  365: "1 año"
} as const;

const timeRangeSchema = z
  .union([z.literal(7), z.literal(30), z.literal(90), z.literal(365)])
  .optional()
  .catch(DEFAULT_TIME_RANGE);

export const Route = createFileRoute("/_dashboard/")({
  validateSearch: z.object({
    highlightedTimeRange: timeRangeSchema,
    incidentTypesTimeRange: timeRangeSchema
  }),
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
      <IncidentTypesChart />
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
