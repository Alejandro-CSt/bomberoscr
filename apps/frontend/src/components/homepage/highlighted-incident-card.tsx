import { GarageIcon, FireTruckIcon } from "@phosphor-icons/react";
import { TriangleAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type HighlightedIncident = {
  id: number;
  slug: string;
  incidentTimestamp: string;
  details: string;
  address: string;
  responsibleStation: string;
  dispatchedVehiclesCount: number;
  dispatchedStationsCount: number;
};

/**
 * Get gradient classes based on heat level
 */
function getHeatGradient(heat: number): string {
  if (heat < 0.2) {
    return "from-blue-600/80 to-cyan-500/80";
  }
  if (heat < 0.4) {
    return "from-cyan-500/80 to-teal-500/80";
  }
  if (heat < 0.6) {
    return "from-teal-500/80 to-green-500/80";
  }
  if (heat < 0.75) {
    return "from-green-500/80 to-yellow-500/80";
  }
  if (heat < 0.9) {
    return "from-yellow-500/80 to-orange-500/80";
  }
  return "from-orange-500/80 to-red-500/80";
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
  }
  if (diffHours > 0) {
    return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  }
  if (diffMinutes > 0) {
    return `hace ${diffMinutes} ${diffMinutes === 1 ? "minuto" : "minutos"}`;
  }
  return "hace un momento";
}

export function HighlightedIncidentCard({ incident }: { incident: HighlightedIncident }) {
  const total = incident.dispatchedStationsCount + incident.dispatchedVehiclesCount;
  const heat = Math.max(0, Math.min((total - 2) / 13, 1));

  return (
    <Link
      to="/incidentes/$slug"
      params={{ slug: incident.slug }}
      className="group flex flex-col overflow-hidden rounded-lg bg-card md:flex-row">
      <div className="relative flex aspect-video w-full items-center justify-center p-1.5 md:aspect-4/3 md:w-[50%] md:p-2">
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-r",
            getHeatGradient(heat)
          )}>
          <div className="w-fit rounded-md bg-background/60 px-3 py-2 backdrop-blur-3xl">
            <p className="flex items-center gap-1.5 text-xs whitespace-nowrap select-none">
              <TriangleAlert
                className="size-3.5 shrink-0 text-amber-500"
                aria-hidden="true"
              />
              Sin imagen
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-3 md:flex-1 md:py-3 md:pr-3 md:pl-1">
        <div className="flex flex-col gap-0.5">
          <h3 className="line-clamp-1 text-base font-medium">{incident.details}</h3>
          <span className="text-sm text-muted-foreground">{incident.responsibleStation}</span>
          <p className="line-clamp-1 text-xs text-muted-foreground md:line-clamp-2">
            {incident.address}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <GarageIcon className="size-4.5" />
              <span className="text-sm font-medium">{incident.dispatchedStationsCount}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <FireTruckIcon className="size-4.5" />
              <span className="text-sm font-medium">{incident.dispatchedVehiclesCount}</span>
            </div>
          </div>
          <span className="shrink-0 text-sm whitespace-nowrap text-muted-foreground first-letter:uppercase">
            {formatRelativeTime(incident.incidentTimestamp)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HighlightedIncidentCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg bg-card md:flex-row", className)}>
      <div className="relative aspect-video w-full p-1.5 md:aspect-4/3 md:w-[50%] md:p-2">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
      <div className="flex flex-col gap-2 p-3 md:flex-1 md:py-3 md:pr-3 md:pl-1">
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full md:h-8" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-10" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}
