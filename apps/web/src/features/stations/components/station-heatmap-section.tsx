import {
  type StationPageParams,
  findStationByName
} from "@/app/(max-w-6xl)/(subheader)/estaciones/[name]/page";
import {
  StationIncidentsHeatmap,
  StationIncidentsHeatmapSkeleton
} from "@/features/stations/components/station-incidents-heatmap";
import { getStationIncidentsPerDay } from "@bomberoscr/db/queries/stations/incidentsPerDay";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

export function StationHeatmapSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Actividad del último año</h2>
        <span className="text-muted-foreground text-sm">-- incidentes</span>
      </header>
      <StationIncidentsHeatmapSkeleton />
    </section>
  );
}

export async function StationHeatmapSection({ params }: { params: StationPageParams }) {
  "use cache";
  cacheLife({ revalidate: 60 * 30, expire: 60 * 30 });
  const { name } = await params;
  const { station } = await findStationByName(name);

  if (!station) {
    notFound();
  }

  const incidentsPerDay = await getStationIncidentsPerDay({ stationId: station.id });
  const totalIncidentsLastYear = incidentsPerDay.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Actividad del último año</h2>
        <span className="text-muted-foreground text-sm">{totalIncidentsLastYear} incidentes</span>
      </header>
      <StationIncidentsHeatmap data={incidentsPerDay} />
    </section>
  );
}
