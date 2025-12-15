import { RelativeTime } from "@/features/shared/components/ui/relative-time";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { FireTruckIcon, GarageIcon } from "@phosphor-icons/react/dist/ssr";
import type { Route } from "next";
import Link from "next/link";

export type BaseIncidentCard = {
  url: Route;
  details: string;
  address: string;
  dispatchedStationsCount: number;
  dispatchedVehiclesCount: number;
  responsibleStation: string | null;
  incidentTimestamp: string;
};

export function IncidentCard({ incident }: { incident: BaseIncidentCard }) {
  return (
    <Link
      href={incident.url}
      className="flex flex-col gap-2 rounded border border-border bg-card p-4 text-sm"
    >
      <h3 className="line-clamp-1 font-medium text-base">{incident.details}</h3>
      <span className="font-medium">{incident.responsibleStation}</span>
      <p className="line-clamp-1 text-muted-foreground">{incident.address}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <GarageIcon size={20} />
            <span>{incident.dispatchedStationsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <FireTruckIcon size={20} />
            <span>{incident.dispatchedVehiclesCount}</span>
          </div>
        </div>
        <RelativeTime
          date={incident.incidentTimestamp}
          className="whitespace-nowrap text-muted-foreground text-xs first-letter:uppercase"
        />
      </div>
    </Link>
  );
}

export function IncidentCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded border border-border bg-card p-4 text-sm">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
