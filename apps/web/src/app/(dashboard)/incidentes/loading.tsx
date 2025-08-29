import { IsOpenIndicatorLegend } from "@/features/incidents/table/components/data-table-is-open-column";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { FilterIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between gap-6 bg-background pb-2">
        <div className="flex items-stretch overflow-hidden rounded-lg border">
          <div className="flex items-center justify-center border-r px-3 py-2">
            <SearchIcon className="size-4" />
          </div>
          <Input
            placeholder="Buscar incidente"
            className="flex-1 border-0 px-3 py-2 outline-0 ring-0 focus-visible:ring-0"
          />
          <div className="flex cursor-pointer items-center justify-center border-l px-3 py-2 hover:bg-muted/50">
            <FilterIcon className="size-4" />
          </div>
        </div>
        <Button variant="outline" size="icon">
          <SlidersHorizontalIcon />
        </Button>
      </div>

      <IsOpenIndicatorLegend className="py-2 text-muted-foreground" />

      <div className="flex-1 overflow-hidden">
        <div className="border border-border md:border-r md:border-l">
          <div className="grid grid-cols-5 gap-4 border-b p-3">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="divide-y">
            {Array(35)
              .fill(0)
              .map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <div key={i} className="grid grid-cols-5 items-center gap-4 p-3">
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
