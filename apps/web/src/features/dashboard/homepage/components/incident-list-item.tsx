import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { buildIncidentUrl, cn, getRelativeTime } from "@/features/shared/lib/utils";
import Link from "next/link";

interface IncidentData {
  id: number;
  districtName: string | null;
  incidentTimestamp: string;
  importantDetails: string;
  dispatchedStationsCount: number;
  dispatchedVehiclesCount: number;
}

interface IncidentListItemProps {
  incident?: IncidentData;
  isLast?: boolean;
  isLoading?: boolean;
  isOdd?: boolean;
}

export function IncidentListItem({
  incident,
  isLast = false,
  isLoading = false,
  isOdd = false
}: IncidentListItemProps) {
  const shouldShowBorder = !isLast;

  if (isLoading || !incident) {
    return (
      <li className={cn("group", shouldShowBorder && "border-b", isOdd && "bg-muted/5")}>
        <div className="grid h-12 grid-cols-[100px_minmax(120px,1fr)_70px] items-center gap-1 p-2 transition-colors duration-200 group-hover:bg-foreground/10">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-full w-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-18" />
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={cn("group", shouldShowBorder && "border-b")}>
      <Link
        href={
          buildIncidentUrl(
            incident.id,
            incident.importantDetails || "Incidente",
            new Date(incident.incidentTimestamp)
          ) as `/incidentes/${string}`
        }
      >
        <div className="grid h-12 grid-cols-[110px_minmax(100px,1fr)_100px] gap-1 p-2 transition-colors duration-200 group-hover:bg-foreground/10">
          <div className="flex flex-col text-xs">
            <p className="overflow-hidden overflow-ellipsis font-semibold text-muted-foreground">
              {incident.districtName || "UBIC. PENDIENTE"}
            </p>
            <p>{getRelativeTime(incident.incidentTimestamp)}</p>
          </div>
          <h3 className="line-clamp-2 text-wrap font-medium text-xs">
            {incident.importantDetails}
          </h3>
          <div className="ms-auto flex flex-col *:text-xs">
            <p className="font-semibold">{incident.dispatchedStationsCount} estaciones</p>
            <p className="font-semibold">{incident.dispatchedVehiclesCount} vehículos</p>
          </div>
        </div>
      </Link>
    </li>
  );
}
