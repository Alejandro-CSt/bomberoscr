import { FireTruckIcon, ShieldIcon, TimerIcon, type Icon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { getSystemOverviewOptions, listStationsOptions } from "@/lib/api/@tanstack/react-query.gen";
import { cn, formatMinutesToHMS } from "@/lib/utils";

interface StationsSystemOverviewCardProps {
  title: string;
  value: string | number;
  icon: Icon;
  className?: string;
}

export function StationsSystemOverviewSection() {
  const { data: systemOverview } = useSuspenseQuery(getSystemOverviewOptions());

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StationsSystemOverviewCard
        title="Estaciones operativas"
        value={systemOverview.stationCount}
        icon={ShieldIcon}
      />
      <StationsSystemOverviewCard
        title="Vehículos activos"
        value={systemOverview.activeVehicleCount}
        icon={FireTruckIcon}
      />
      <StationsSystemOverviewCard
        title="Tiempo respuesta promedio"
        value={
          systemOverview.avgResponseTimeMinutes
            ? formatMinutesToHMS(systemOverview.avgResponseTimeMinutes)
            : "N/A"
        }
        icon={TimerIcon}
      />
    </div>
  );
}

export function StationsSystemOverviewCard({
  title,
  value,
  icon: Icon,
  className
}: StationsSystemOverviewCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-32 flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md",
        className
      )}>
      <div className="z-10 flex justify-start">
        <span className="text-sm font-medium tracking-tight text-muted-foreground">{title}</span>
      </div>

      <div className="z-10">
        <span className="text-4xl font-bold tracking-tighter">{value}</span>
      </div>

      <Icon
        className="absolute top-1 right-1 h-24 w-24 text-muted-foreground/10"
        weight="thin"
      />
    </div>
  );
}

export function StationsSystemOverviewCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-32 flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
        className
      )}>
      <div className="z-10 flex justify-start">
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="z-10">
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

export function StationsSystemOverviewSkeletonSection() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StationsSystemOverviewCardSkeleton />
      <StationsSystemOverviewCardSkeleton />
      <StationsSystemOverviewCardSkeleton />
    </div>
  );
}
