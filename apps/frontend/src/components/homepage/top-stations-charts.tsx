import { WarningIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import {
  ChartSkeleton,
  ChartSkeletonWithFooter
} from "@/components/homepage/charts/chart-skeleton";
import { TopDispatchedStationsChart } from "@/components/homepage/charts/top-dispatched-stations-chart";
import { TopResponseTimesStationsChart } from "@/components/homepage/charts/top-response-times-chart";
import {
  getStatsTopDispatchedStationsOptions,
  getStatsTopResponseTimesOptions
} from "@/lib/api/@tanstack/react-query.gen";

function TopDispatchedStationsSection() {
  const { data, isLoading, isError } = useQuery({
    ...getStatsTopDispatchedStationsOptions(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000
  });

  if (isLoading) {
    return (
      <ChartSkeleton
        title="Estaciones mas despachadas"
        description="Estaciones con mas despachos (responsable y apoyo) - Ultimos 30 dias"
      />
    );
  }

  if (isError || !data) {
    return (
      <div className="relative">
        <ChartSkeleton
          title="Estaciones mas despachadas"
          description="Estaciones con mas despachos (responsable y apoyo) - Ultimos 30 dias"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 p-4 text-center text-sm text-muted-foreground backdrop-blur-sm">
          <WarningIcon className="size-6" />
          Ocurrio un error cargando los datos
        </div>
      </div>
    );
  }

  return <TopDispatchedStationsChart stations={data} />;
}

function TopResponseTimesSection() {
  const { data, isLoading, isError } = useQuery({
    ...getStatsTopResponseTimesOptions(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000
  });

  if (isLoading) {
    return (
      <ChartSkeletonWithFooter
        title="Tiempos de respuesta"
        description="Las 3 estaciones mas rapidas, mas lentas y promedio nacional - Ultimos 365 dias"
      />
    );
  }

  if (isError || !data) {
    return (
      <div className="relative">
        <ChartSkeletonWithFooter
          title="Tiempos de respuesta"
          description="Las 3 estaciones mas rapidas, mas lentas y promedio nacional - Ultimos 365 dias"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 p-4 text-center text-sm text-muted-foreground backdrop-blur-sm">
          <WarningIcon className="size-6" />
          Ocurrio un error cargando los datos
        </div>
      </div>
    );
  }

  return <TopResponseTimesStationsChart stations={data} />;
}

export function TopStationsCharts() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TopDispatchedStationsSection />
      <TopResponseTimesSection />
    </section>
  );
}
