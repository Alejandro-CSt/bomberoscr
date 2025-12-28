import {
  type StationPageParams,
  findStationByName
} from "@/app/(max-w-6xl)/(subheader)/estaciones/[name]/page";
import { Badge } from "@/features/shared/components/ui/badge";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { getStationVehiclesWithStats } from "@bomberoscr/db/queries/stations/vehiclesWithStats";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

function formatResponseTime(seconds: number | null): string {
  if (seconds === null) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

export async function StationVehicles({ params }: { params: StationPageParams }) {
  "use cache";
  cacheLife({ revalidate: 60 * 60, expire: 60 * 60 });

  const { name } = await params;
  const { station } = await findStationByName(name);

  if (!station) {
    notFound();
  }

  const vehicles = await getStationVehiclesWithStats({ stationId: station.id });

  if (vehicles.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-semibold text-lg">Unidades</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => {
          return (
            <article
              key={vehicle.id}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-200 hover:border-border hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg leading-tight">{vehicle.internalNumber}</h3>
                  <p className="truncate text-muted-foreground text-sm">
                    Placa {vehicle.plate}
                    {vehicle.class && ` - ${vehicle.class}`}
                  </p>
                </div>
                <Badge variant="outline" size="sm" className="rounded-full p-1">
                  {vehicle.descriptionOperationalStatus}
                </Badge>
              </div>

              <div className="flex border-border/50 border-t">
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="font-semibold text-xl tabular-nums leading-none">
                    {vehicle.stats.incidentCount.toLocaleString("es-CR")}
                  </p>
                  <p className="text-muted-foreground text-xs">Despachos en 30 días</p>
                </div>
                <div className="w-px bg-border/50" />
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="font-semibold text-xl tabular-nums leading-none">
                    {formatResponseTime(vehicle.stats.avgResponseTimeSeconds)}
                  </p>
                  <p className="text-muted-foreground text-xs">Tiempo resp. promedio</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function StationVehiclesSkeleton() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-semibold text-lg">Unidades</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <Skeleton className="h-[20.5px] w-16" />
                <Skeleton className="mt-1 h-3.5 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex border-border/50 border-t">
              <div className="flex flex-1 flex-col gap-1 p-4">
                <Skeleton className="h-6 w-12" />
                <p className="text-muted-foreground text-xs">Despachos en 30 días</p>
              </div>
              <div className="w-px bg-border/50" />
              <div className="flex flex-1 flex-col gap-1 p-4">
                <Skeleton className="h-6 w-20" />
                <p className="text-muted-foreground text-xs">Tiempo resp. promedio</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
