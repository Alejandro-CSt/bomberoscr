import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AnnualRecapSection } from "@/components/homepage/annual-recap-section";
import { DailyResponseTimesLineChart } from "@/components/homepage/charts/daily-response-times-line-chart";
import { RecentIncidentsHoursBarChart } from "@/components/homepage/charts/recent-incidents-hours-bar-chart";
import { HighlightedIncidents } from "@/components/homepage/highlighted-incidents";
import { IncidentTypesChart } from "@/components/homepage/incident-types-chart";
import { LandingHero } from "@/components/homepage/landing-hero";
import { LatestIncidents } from "@/components/homepage/latest-incidents";
import { Separator } from "@/components/homepage/separator";
// import { MapCTA } from "@/components/homepage/map-cta";

const title = "Emergencias CR - Incidentes de Bomberos en Tiempo Real";
const description =
  "Monitoreo en tiempo real de incidentes del Cuerpo de Bomberos de Costa Rica. Visualiza emergencias activas, mapa de estaciones y estadísticas operativas.";

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

const hourlyIncidentsTimeRangeSchema = z
  .union([z.literal(24), z.literal(48), z.literal(72)])
  .optional()
  .catch(24);

export const Route = createFileRoute("/_dashboard/")({
  validateSearch: z.object({
    highlightedTimeRange: timeRangeSchema,
    incidentTypesTimeRange: timeRangeSchema,
    dailyResponseTimesTimeRange: timeRangeSchema,
    incidentsByHourTimeRange: hourlyIncidentsTimeRangeSchema
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
    <div className="-mt-8 flex flex-col gap-8">
      <LandingHero />
      <section className="mt-6 flex flex-col py-8">
        <AnnualRecapSection />
        <DailyResponseTimesLineChart />
        <RecentIncidentsHoursBarChart />
      </section>
      <Separator />
      <HighlightedIncidents />
      <LatestIncidents />
      {/* <MapCTA /> */}
      <Separator />
      <IncidentTypesChart />
    </div>
  );
}
