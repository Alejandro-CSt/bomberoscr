import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { cn } from "@/features/shared/lib/utils";
import type { Icon } from "@phosphor-icons/react";

interface StationStatCardProps {
  title: string;
  value: string | number;
  icon: Icon;
  className?: string;
}

export function StationStatCard({
  title,
  value,
  icon: IconComponent,
  className
}: StationStatCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-32 flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="z-10 flex justify-start">
        <span className="font-medium text-muted-foreground text-sm tracking-tight">{title}</span>
      </div>

      <div className="z-10">
        <span className="font-bold text-4xl tracking-tighter">{value}</span>
      </div>

      <IconComponent
        className="absolute top-1 right-1 h-24 w-24 text-muted-foreground/10"
        weight="thin"
      />
    </div>
  );
}

export function StationStatCardSkeleton() {
  return (
    <div className="relative flex h-32 flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex justify-start">
        <Skeleton className="h-4 w-24" />
      </div>
      <div>
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}
