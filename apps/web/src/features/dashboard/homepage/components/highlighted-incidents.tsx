"use client";

import type { MinimalIncident } from "@/features/dashboard/homepage/api/homepageRouter";
import {
  HighlightedIncidentCard,
  HighlightedIncidentCardSkeleton
} from "@/features/dashboard/homepage/components/highlighted-incident-card";
import useTimeRangeQueryState from "@/features/dashboard/homepage/hooks/useTimeRangeQueryState";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue
} from "@/features/shared/components/ui/select";
import { trpc } from "@/features/trpc/client";
import { ALLOWED_TIME_RANGE_VALUES, TIME_RANGE_LABELS } from "@bomberoscr/lib/time-range";

export function HighlightedIncidents() {
  const { timeRange, setTimeRange } = useTimeRangeQueryState();
  const {
    data: incidents,
    isLoading,
    isError
  } = trpc.homepage.getHighlightedIncidents.useQuery({
    timeRange,
    limit: 6
  });

  const minimalIncidents: MinimalIncident[] = incidents ?? [];

  return (
    <section className="flex flex-col gap-4 pt-8">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-xl lg:text-2xl">Destacados</h2>
        <Select
          value={timeRange.toString()}
          onValueChange={(val) => setTimeRange(Number(val))}
          items={ALLOWED_TIME_RANGE_VALUES.map((value) => ({
            label: TIME_RANGE_LABELS[value as keyof typeof TIME_RANGE_LABELS],
            value: value.toString()
          }))}
        >
          <SelectTrigger size="sm" className="w-28 min-w-0">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup sideOffset={8}>
            {ALLOWED_TIME_RANGE_VALUES.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {TIME_RANGE_LABELS[value as keyof typeof TIME_RANGE_LABELS]}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>

      {isError ? (
        <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-sm">
          <p className="font-semibold text-destructive">Error al cargar</p>
          <p className="text-muted-foreground">No se pudieron cargar los incidentes destacados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isLoading || !incidents
            ? ["one", "two", "three", "four", "five", "six"].map((key) => (
                <HighlightedIncidentCardSkeleton key={key} />
              ))
            : minimalIncidents.map((incident) => (
                <HighlightedIncidentCard key={incident.url} incident={incident} />
              ))}
        </div>
      )}
    </section>
  );
}
