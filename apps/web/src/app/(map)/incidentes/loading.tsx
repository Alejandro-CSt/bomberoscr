import { FloatingPanelHeader } from "@/map/layout/components/floating-panel-header";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <FloatingPanelHeader title="Incidentes" />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center">
          <span className="mr-2 text-muted-foreground text-sm">Filtrar</span>
          <Select disabled defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las estaciones" />
            </SelectTrigger>
            <SelectContent>
              <div />
            </SelectContent>
          </Select>
        </div>
        <div className="mb-8 flex flex-col gap-2 md:overflow-y-auto">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={i} className="rounded-lg border p-4">
                <div className="flex justify-between gap-2">
                  <div className="flex flex-col">
                    <Skeleton className="mb-1 h-5 w-36 sm:w-48" />
                    <Skeleton className="h-4 w-28 sm:w-32" />
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                    <Skeleton className="h-5 w-20 sm:w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 sm:w-20" />
                      <Skeleton className="h-5 w-16 sm:w-20" />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-4/5" />
                </div>

                <div className="mt-3 flex flex-col">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-1 h-4 w-36" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
