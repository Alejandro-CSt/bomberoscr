import { StatCard } from "@/features/dashboard/homepage/components/stat-card";
// import { DotsLoader } from "@/features/shared/components/ui/dots-loader";
// import { Button } from "@/features/shared/components/ui/button";
import { getYearRecap } from "@bomberoscr/db/queries/homepage/yearRecap";
import { unstable_cacheLife as cacheLife } from "next/cache";

export async function YearRecapHero() {
  "use cache";
  cacheLife({ revalidate: 60 * 30, expire: 60 * 30 });
  const year = new Date().getFullYear();
  const data = await getYearRecap(year);
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

  const headingText = year === currentYear ? `En lo que va del ${year}...` : `En el ${year}...`;

  return (
    <div className="relative flex select-none flex-col gap-4 rounded-lg py-4">
      {/* {(isLoading || !data) && (
        <div className="absolute inset-0 z-30 bg-background/95 p-6 backdrop-blur-sm">
          <div className="flex h-full items-center justify-center">
            <DotsLoader className="text-muted-foreground" size="md" />
          </div>
        </div>
      )} */}
      <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl">{headingText}</h1>

      <div className="z-10 grid grid-cols-1 gap-4 md:auto-rows-[140px] md:grid-cols-12 lg:grid-cols-12">
        <div className="hover:-translate-y-0.5 flex flex-col justify-center rounded-lg bg-gradient-to-br from-background/60 to-muted/60 p-6 backdrop-blur-sm transition-all duration-300 ease-out will-change-transform hover:shadow-lg hover:ring-1 hover:ring-ring/30 md:col-span-6 md:row-span-2 lg:col-span-6">
          <p className="text-lg text-muted-foreground leading-relaxed md:text-xl">
            Bomberos atendió en promedio un incidente
            <span className="mt-2 block font-bold text-4xl text-destructive md:text-5xl">
              {data?.frequency ? `cada ${data.frequency} minutos` : ""}
            </span>
            <span className="mt-2 block text-base md:text-lg">
              para un total de{" "}
              <span className="font-bold text-3xl text-primary md:text-4xl">
                {formatNumber(data?.totalIncidents ?? 0)}
              </span>{" "}
              incidentes.
            </span>
          </p>
        </div>

        <StatCard
          title="Día con más incidentes"
          value={data?.busiestDate?.date ? formatBusiestDate(data.busiestDate.date) : "N/A"}
          secondValue={`${formatNumber(data?.busiestDate?.count ?? 0)} incidentes`}
          size="small"
          className="md:col-span-3 lg:col-span-3"
        />

        <StatCard
          title="Estación más despachada"
          value={data?.busiestStation?.name || "N/A"}
          secondValue={`${formatNumber(data?.busiestStation?.count ?? 0)} despachos`}
          className="md:col-span-3 lg:col-span-3"
        />

        <StatCard
          title="Vehículo más despachado"
          value={data?.busiestVehicle?.internalNumber || "N/A"}
          secondValue={`${formatNumber(data?.busiestVehicle?.count ?? 0)} despachos`}
          className="md:col-span-3 lg:col-span-3"
        />

        <StatCard
          title="Tipo de incidente más común"
          value={data?.mostPopularIncidentType?.name || "N/A"}
          secondValue={`${formatNumber(data?.mostPopularIncidentType?.count ?? 0)} incidentes`}
          className="md:col-span-3 lg:col-span-3"
        />
      </div>
      {/* <div className="flex items-baseline gap-2 text-sm">
        <span className="text-muted-foreground">Ver</span>
        {yearOptions.map((yearOption) => (
          <Button
            key={yearOption}
            variant="link"
            size="sm"
            onClick={() => setYear(yearOption)}
            className={cn(
              "h-auto p-0 text-foreground hover:text-primary",
              year === yearOption && "text-primary"
            )}
          >
            {yearOption}
          </Button>
        ))}
      </div> */}
    </div>
  );
}
