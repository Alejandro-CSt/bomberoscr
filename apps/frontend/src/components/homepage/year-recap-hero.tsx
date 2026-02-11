import { WarningIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { StatCard, StatCardSkeleton } from "@/components/homepage/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getYearRecapOptions } from "@/lib/api/@tanstack/react-query.gen";

import type { GetYearRecapResponse } from "@/lib/api/types.gen";

function YearRecapContent({ data }: { data: GetYearRecapResponse }) {
  const currentYear = new Date().getFullYear();

  const formatBusiestDate = (dateString: string) => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat("es-CR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
    return formatter.format(date);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat("es-CR").format(number);
  };

  const headingText =
    data.year === currentYear ? `En lo que va del ${data.year}...` : `En el ${data.year}...`;

  return (
    <div className="z-10 grid grid-cols-1 gap-4 md:auto-rows-[140px] md:grid-cols-12 lg:grid-cols-12">
      <div className="flex flex-col justify-center rounded-lg bg-gradient-to-br from-background/60 to-muted/60 p-6 backdrop-blur-sm transition-all duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-ring/30 md:col-span-6 md:row-span-2 lg:col-span-6">
        <h2 className="mb-4 text-2xl font-bold md:text-3xl lg:text-4xl">{headingText}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
          Bomberos atendió en promedio un incidente
          <span className="mt-2 block text-4xl font-bold text-destructive md:text-5xl">
            {data.frequency ? `cada ${data.frequency} minutos` : ""}
          </span>
          <span className="mt-2 block text-base md:text-lg">
            para un total de{" "}
            <span className="text-3xl font-bold text-primary md:text-4xl">
              {formatNumber(data.totalIncidents ?? 0)}
            </span>{" "}
            incidentes.
          </span>
        </p>
      </div>

      <StatCard
        title="Día con más incidentes"
        value={data.busiestDate?.date ? formatBusiestDate(data.busiestDate.date) : "N/A"}
        secondValue={`${formatNumber(data.busiestDate?.count ?? 0)} incidentes`}
        className="md:col-span-3 lg:col-span-3"
      />

      <StatCard
        title="Estación más despachada"
        value={data.busiestStation?.name || "N/A"}
        secondValue={`${formatNumber(data.busiestStation?.count ?? 0)} despachos`}
        className="md:col-span-3 lg:col-span-3"
      />

      <StatCard
        title="Vehículo más despachado"
        value={data.busiestVehicle?.internalNumber || "N/A"}
        secondValue={`${formatNumber(data.busiestVehicle?.count ?? 0)} despachos`}
        className="md:col-span-3 lg:col-span-3"
      />

      <StatCard
        title="Tipo de incidente más común"
        value={data.mostPopularIncidentType?.name || "N/A"}
        secondValue={`${formatNumber(data.mostPopularIncidentType?.count ?? 0)} incidentes`}
        className="md:col-span-3 lg:col-span-3"
      />
    </div>
  );
}

function YearRecapSkeleton() {
  return (
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
  );
}

export function YearRecapHero() {
  const yearRecapOptions = getYearRecapOptions();

  const { data, isLoading, isError } = useQuery({
    ...yearRecapOptions,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000
  });

  if (isLoading) {
    return (
      <section className="relative flex flex-col gap-4 rounded-lg py-4 select-none">
        <YearRecapSkeleton />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="relative flex flex-col gap-4 rounded-lg py-4 select-none">
        <div className="relative">
          <YearRecapSkeleton />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 p-4 text-center text-sm text-muted-foreground backdrop-blur-sm">
            <WarningIcon className="size-6" />
            Ocurrió un error cargando las estadísticas anuales
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex flex-col gap-4 rounded-lg py-4 select-none">
      <YearRecapContent data={data} />
    </section>
  );
}
