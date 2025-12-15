import type { MinimalIncident } from "@/features/dashboard/homepage/api/homepageRouter";
import { RelativeTime } from "@/features/shared/components/ui/relative-time";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { MAP_BLUR_DATA_URL } from "@/features/shared/lib/constants";
import { cn } from "@/features/shared/lib/utils";
import { FireTruckIcon, GarageIcon } from "@phosphor-icons/react/dist/ssr";
import { TriangleAlertIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

function hasValidCoordinates(lat: string, lng: string): boolean {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Boolean(latitude && longitude && latitude !== 0 && longitude !== 0);
}

export function HighlightedIncidentCard({ incident }: { incident: MinimalIncident }) {
  const total = Number(incident.dispatchedStationsCount) + Number(incident.dispatchedVehiclesCount);
  const heat = Math.max(0, Math.min((total - 2) / 13, 1));
  const hasMap = hasValidCoordinates(incident.latitude, incident.longitude);
  const mapUrl = `/bomberos${incident.url}/map`;

  return (
    <Link
      href={incident.url}
      className="group flex flex-col overflow-hidden rounded-lg bg-card md:flex-row"
    >
      <div className="relative flex aspect-video w-full items-center justify-center p-1.5 md:aspect-4/3 md:w-[50%] md:p-2">
        {hasMap ? (
          <div className="h-full w-full overflow-hidden rounded-lg">
            <Image
              src={mapUrl}
              alt=""
              referrerPolicy="origin"
              className="h-full w-full scale-125 object-cover transition-transform duration-300 ease-out group-hover:scale-150"
              loading="lazy"
              width={640}
              height={360}
              placeholder="blur"
              blurDataURL={MAP_BLUR_DATA_URL}
            />
          </div>
        ) : (
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center rounded-lg bg-linear-to-r",
              getHeatGradient(heat)
            )}
          >
            <div className="w-fit rounded-md bg-background/60 px-3 py-2 backdrop-blur-3xl">
              <p className="flex select-none items-center gap-1.5 whitespace-nowrap text-xs">
                <TriangleAlertIcon
                  className="shrink-0 text-amber-500"
                  size={14}
                  aria-hidden="true"
                />
                Sin coordenadas
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3 md:flex-1 md:py-3 md:pr-3 md:pl-1">
        <div className="flex flex-col gap-0.5">
          <h3 className="line-clamp-1 font-medium text-base">{incident.details}</h3>
          <span className="text-muted-foreground text-sm">{incident.responsibleStation}</span>
          <p className="line-clamp-1 text-muted-foreground text-xs md:line-clamp-2">
            {incident.address}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <GarageIcon size={18} />
              <span className="font-medium text-sm">{incident.dispatchedStationsCount}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <FireTruckIcon size={18} />
              <span className="font-medium text-sm">{incident.dispatchedVehiclesCount}</span>
            </div>
          </div>
          <RelativeTime
            date={incident.incidentTimestamp}
            className="text-muted-foreground text-sm first-letter:uppercase"
          />
        </div>
      </div>
    </Link>
  );
}

export function HighlightedIncidentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card md:flex-row">
      <div className="relative aspect-video w-full p-1.5 md:aspect-4/3 md:w-[50%] md:p-2">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
      <div className="flex flex-col gap-2 p-3 md:flex-1 md:py-3 md:pr-3 md:pl-1">
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-[24px] w-3/4" />
          <Skeleton className="h-[20px] w-1/3" />
          <Skeleton className="h-[16px] w-full md:h-[32px]" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-[18px] w-12" />
            <Skeleton className="h-[18px] w-12" />
          </div>
          <Skeleton className="h-[20px] w-20" />
        </div>
      </div>
    </div>
  );
}
