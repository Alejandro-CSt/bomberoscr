import { WarningIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import {
  ChartSkeleton,
  ChartSkeletonWithFooter
} from "@/components/homepage/charts/chart-skeleton";
import { DailyIncidentsChart } from "@/components/homepage/charts/daily-incidents-chart";
import { IncidentsByDayOfWeekChart } from "@/components/homepage/charts/incidents-by-day-of-week-chart";
import { IncidentsByHourChart } from "@/components/homepage/charts/incidents-by-hour-chart";
import {
  getDailyIncidentsOptions,
  getIncidentsByDayOfWeekOptions,
  getIncidentsByHourOptions
} from "@/lib/api/@tanstack/react-query.gen";

function IncidentsByDayOfWeekSection() {
  const { data, isLoading, isError } = useQuery({
    ...getIncidentsByDayOfWeekOptions({ query: { timeRange: 30 } }),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000
  });

  if (isLoading) {
    return (
      <ChartSkeleton
        title="Incidentes por dia de la semana"
        description="Distribucion de incidentes por dia - Ultimos 30 dias"
      />
    );
  }

  if (isError || !data) {
    return (
      <div className="relative">
        <ChartSkeleton
          title="Incidentes por dia de la semana"
          description="Distribucion de incidentes por dia - Ultimos 30 dias"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 p-4 text-center text-sm text-muted-foreground backdrop-blur-sm">
          <WarningIcon className="size-6" />
          Ocurrio un error cargando los datos
        </div>
      </div>
    );
  }

  return <IncidentsByDayOfWeekChart incidents={data} />;
}

function IncidentsByHourSection() {
  const { data, isLoading, isError } = useQuery({
    ...getIncidentsByHourOptions({ query: { timeRange: 30 } }),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000
  });

  if (isLoading) {
    return (
      <ChartSkeleton
        title="Incidentes por hora del dia"
        description="Distribucion de incidentes por hora - Ultimos 30 dias"
      />
    );
  }

  if (isError || !data) {
    return (
      <div className="relative">
        <ChartSkeleton
          title="Incidentes por hora del dia"
          description="Distribucion de incidentes por hora - Ultimos 30 dias"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 p-4 text-center text-sm text-muted-foreground backdrop-blur-sm">
          <WarningIcon className="size-6" />
          Ocurrio un error cargando los datos
        </div>
      </div>
    );
  }

  return <IncidentsByHourChart incidents={data} />;
}

function DailyIncidentsSection() {
  const { data, isLoading, isError } = useQuery({
    ...getDailyIncidentsOptions({ query: { timeRange: 30 } }),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000
  });

  if (isLoading) {
    return (
      <ChartSkeletonWithFooter
        title="Incidentes diarios"
        description="Comparacion de incidentes por dia - 30 dias actual vs anterior"
        className="col-span-full"
      />
    );
  }

  if (isError || !data) {
    return (
      <div className="relative col-span-full">
        <ChartSkeletonWithFooter
          title="Incidentes diarios"
          description="Comparacion de incidentes por dia - 30 dias actual vs anterior"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 p-4 text-center text-sm text-muted-foreground backdrop-blur-sm">
          <WarningIcon className="size-6" />
          Ocurrio un error cargando los datos
        </div>
      </div>
    );
  }

  return <DailyIncidentsChart incidents={data} />;
}

export function IncidentDistributionCharts() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <IncidentsByDayOfWeekSection />
      <IncidentsByHourSection />
      <DailyIncidentsSection />
    </section>
  );
}
