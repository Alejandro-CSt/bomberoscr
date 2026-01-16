import { Skeleton } from "@/components/ui/skeleton";

import { StationIncidentsHeatmap } from "./station-incidents-heatmap";

interface StationHeatmapSectionProps {
  data: Array<{ date: string; count: number }>;
  totalIncidents: number;
}

/** Props that match the API response shape */
export interface StationHeatmapSectionApiProps {
  data: Array<{ date: string; count: number }>;
  totalIncidents: number;
}

export function StationHeatmapSection({ data, totalIncidents }: StationHeatmapSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Actividad del último año</h2>
        <span className="text-sm text-muted-foreground">{totalIncidents} incidentes</span>
      </header>
      <StationIncidentsHeatmap data={data} />
    </section>
  );
}

export function StationHeatmapSectionSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </header>
      <div className="flex flex-col gap-2">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="mb-1 ml-6 flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-3 w-8"
                />
              ))}
            </div>
            <div className="flex gap-1">
              <div className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-3 w-4"
                  />
                ))}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 53 }).map((_, weekIdx) => (
                  <div
                    key={weekIdx}
                    className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIdx) => (
                      <Skeleton
                        key={dayIdx}
                        className="h-3 w-3"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-3 w-10" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-3 w-3"
              />
            ))}
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </section>
  );
}
