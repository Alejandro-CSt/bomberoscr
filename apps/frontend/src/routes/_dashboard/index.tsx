import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { LandingHero } from "@/components/homepage/landing-hero";
import { Separator } from "@/components/homepage/separator";
// import { MapCTA } from "@/components/homepage/map-cta";

const AnnualRecapSection = lazy(async () => {
  const module = await import("@/components/homepage/annual-recap-section");
  return { default: module.AnnualRecapSection };
});

const DailyResponseTimesLineChart = lazy(async () => {
  const module = await import("@/components/homepage/charts/daily-response-times-line-chart");
  return { default: module.DailyResponseTimesLineChart };
});

const RecentIncidentsHoursBarChart = lazy(async () => {
  const module = await import("@/components/homepage/charts/recent-incidents-hours-bar-chart");
  return { default: module.RecentIncidentsHoursBarChart };
});

const HighlightedIncidents = lazy(async () => {
  const module = await import("@/components/homepage/highlighted-incidents");
  return { default: module.HighlightedIncidents };
});

const LatestIncidents = lazy(async () => {
  const module = await import("@/components/homepage/latest-incidents");
  return { default: module.LatestIncidents };
});

const IncidentTypesChart = lazy(async () => {
  const module = await import("@/components/homepage/incident-types-chart");
  return { default: module.IncidentTypesChart };
});

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

function SectionPlaceholder({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full animate-pulse bg-muted/20 ${className}`}
    />
  );
}

function DeferredSection({
  children,
  placeholderClassName,
  rootMargin = "320px 0px"
}: {
  children: JSX.Element;
  placeholderClassName: string;
  rootMargin?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin]);

  return (
    <div ref={sectionRef}>
      {isVisible ? (
        <Suspense fallback={<SectionPlaceholder className={placeholderClassName} />}>
          {children}
        </Suspense>
      ) : (
        <SectionPlaceholder className={placeholderClassName} />
      )}
    </div>
  );
}

function HomePage() {
  return (
    <div className="-mt-8 flex flex-col gap-8">
      <LandingHero />
      <DeferredSection placeholderClassName="mt-6 h-[920px] py-8 md:h-[980px] lg:h-[860px]">
        <section className="mt-6 flex flex-col py-8">
          <AnnualRecapSection />
          <DailyResponseTimesLineChart />
          <RecentIncidentsHoursBarChart />
        </section>
      </DeferredSection>
      <Separator />
      <DeferredSection
        rootMargin="420px 0px"
        placeholderClassName="h-[560px] md:h-[620px]">
        <HighlightedIncidents />
      </DeferredSection>
      <DeferredSection
        rootMargin="520px 0px"
        placeholderClassName="h-[560px] md:h-[620px]">
        <LatestIncidents />
      </DeferredSection>
      {/* <MapCTA /> */}
      <Separator />
      <DeferredSection
        rootMargin="620px 0px"
        placeholderClassName="h-[420px] md:h-[460px]">
        <IncidentTypesChart />
      </DeferredSection>
    </div>
  );
}
