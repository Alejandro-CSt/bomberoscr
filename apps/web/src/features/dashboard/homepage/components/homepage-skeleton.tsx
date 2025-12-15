import {
  ChartSkeleton,
  ChartSkeletonWithFooter
} from "@/features/dashboard/homepage/charts/components/chart-skeleton";
import { HighlightedIncidentCardSkeleton } from "@/features/dashboard/homepage/components/highlighted-incident-card";
import { StatCardSkeleton } from "@/features/dashboard/homepage/components/stat-card";
import { IncidentCardSkeleton } from "@/features/shared/components/incident-card";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { Tabs, TabsList, TabsTab } from "@/features/shared/components/ui/tabs";
import {
  ALLOWED_TIME_RANGE_VALUES,
  DEFAULT_TIME_RANGE,
  TIME_RANGE_LABELS
} from "@bomberoscr/lib/time-range";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

function HighlightedIncidentsSkeleton() {
  return (
    <section className="flex flex-col gap-4 pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-semibold text-xl lg:text-2xl">Destacados</h2>
        <Tabs value={String(DEFAULT_TIME_RANGE)}>
          <TabsList variant="underline" className="h-8">
            {ALLOWED_TIME_RANGE_VALUES.map((value) => (
              <TabsTab
                key={value}
                value={String(value)}
                render={<Link href={{ pathname: "/", query: { timeRange: value } }} />}
                nativeButton={false}
                className="rounded-none border-none px-3 py-1.5 text-sm"
              >
                {TIME_RANGE_LABELS[value as keyof typeof TIME_RANGE_LABELS]}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <HighlightedIncidentCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}

function LatestIncidentsSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-xl lg:text-2xl">Recientes</h2>
        <span className="flex items-center gap-1 font-medium text-muted-foreground text-sm">
          Ver todos
          <ArrowRightIcon className="size-3.5" />
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <IncidentCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}

function MapCTASkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-xl" />;
}

function YearRecapSkeleton() {
  return (
    <div className="relative flex select-none flex-col gap-4 rounded-lg py-4">
      <div className="z-10 grid grid-cols-1 gap-4 md:auto-rows-[140px] md:grid-cols-12 lg:grid-cols-12">
        <div className="flex flex-col justify-center rounded-lg bg-gradient-to-br from-background/60 to-muted/60 p-6 backdrop-blur-sm md:col-span-6 md:row-span-2 lg:col-span-6">
          <Skeleton className="mb-4 h-10 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>

        <StatCardSkeleton className="md:col-span-3 lg:col-span-3" />
        <StatCardSkeleton className="md:col-span-3 lg:col-span-3" />
        <StatCardSkeleton className="md:col-span-3 lg:col-span-3" />
        <StatCardSkeleton className="md:col-span-3 lg:col-span-3" />
      </div>
    </div>
  );
}

function TopStationsChartsSkeleton() {
  return (
    <>
      <ChartSkeleton
        title="Estaciones más despachadas"
        description="Estaciones con más despachos (responsable y apoyo) - Últimos 30 días"
      />
      <ChartSkeletonWithFooter
        title="Tiempos de respuesta"
        description="Las 3 estaciones más rápidas, más lentas y promedio nacional - Últimos 365 días"
      />
    </>
  );
}

function IncidentDistributionChartsSkeleton() {
  return (
    <>
      <ChartSkeleton
        title="Incidentes por día de la semana"
        description="Distribución de incidentes por día - Últimos 30 días"
      />
      <ChartSkeleton
        title="Incidentes por hora del día"
        description="Distribución de incidentes por hora - Últimos 30 días"
      />
      <ChartSkeletonWithFooter
        title="Incidentes diarios"
        description="Comparación de incidentes por día - 30 días actual vs anterior"
        className="col-span-full"
      />
    </>
  );
}

function ParticlesMapSkeleton() {
  return (
    <div className="flex w-full items-center justify-center p-8">
      <Skeleton className="aspect-square w-full max-w-[600px]" />
    </div>
  );
}

export function HomepageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <HighlightedIncidentsSkeleton />
      <LatestIncidentsSkeleton />
      <MapCTASkeleton />
      <YearRecapSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopStationsChartsSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IncidentDistributionChartsSkeleton />
      </div>
      <ParticlesMapSkeleton />
    </div>
  );
}
