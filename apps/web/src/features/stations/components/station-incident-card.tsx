import { RelativeTime } from "@/features/shared/components/ui/relative-time";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { MAP_BLUR_DATA_URL } from "@/features/shared/lib/constants";
import { cn } from "@/features/shared/lib/utils";
import { FireTruckIcon, GarageIcon } from "@phosphor-icons/react/dist/ssr";
import { TriangleAlertIcon } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

function getHeatGradient(heat: number): string {
  if (heat < 0.2) return "from-blue-600/80 to-cyan-500/80";
  if (heat < 0.4) return "from-cyan-500/80 to-teal-500/80";
  if (heat < 0.6) return "from-teal-500/80 to-green-500/80";
  if (heat < 0.75) return "from-green-500/80 to-yellow-500/80";
  if (heat < 0.9) return "from-yellow-500/80 to-orange-500/80";
  return "from-orange-500/80 to-red-500/80";
}

function hasValidCoordinates(lat: string, lng: string): boolean {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Boolean(latitude && longitude && latitude !== 0 && longitude !== 0);
}

export type StationIncident = {
  id: number;
  url: Route;
  details: string;
  address: string;
  dispatchedStationsCount: number;
  dispatchedVehiclesCount: number;
  responsibleStation: string | null;
  incidentTimestamp: string;
  latitude: string;
  longitude: string;
};

export function StationIncidentCard({ incident }: { incident: StationIncident }) {
  const total = incident.dispatchedStationsCount + incident.dispatchedVehiclesCount;
  const heat = Math.max(0, Math.min((total - 2) / 13, 1));
  const hasMap = hasValidCoordinates(incident.latitude, incident.longitude);
  const mapUrl = `/bomberos${incident.url}/map`;

  return (
    <Link href={incident.url} className="group flex overflow-hidden rounded-lg bg-card">
      <div className="relative flex aspect-square w-24 shrink-0 items-center justify-center p-1">
        {hasMap ? (
          <div className="h-full w-full overflow-hidden rounded-md">
            <Image
              src={mapUrl}
              alt="Mapa del incidente"
              referrerPolicy="origin"
              className="h-full w-full scale-125 object-cover transition-transform duration-300 ease-out group-hover:scale-150"
              loading="lazy"
              width={256}
              height={256}
              placeholder="blur"
              blurDataURL={MAP_BLUR_DATA_URL}
            />
          </div>
        ) : (
          <div
            className={cn(
              "relative flex h-full w-full items-center justify-center rounded-md bg-linear-to-r",
              getHeatGradient(heat)
            )}
          >
            <div className="w-fit rounded-sm bg-background/60 p-1.5 backdrop-blur-3xl">
              <TriangleAlertIcon className="shrink-0 text-amber-500" size={14} aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2 pr-3 pl-2">
        <h3 className="line-clamp-2 font-medium text-sm leading-tight">{incident.details}</h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <GarageIcon size={14} />
              <span className="text-xs">{incident.dispatchedStationsCount}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <FireTruckIcon size={14} />
              <span className="text-xs">{incident.dispatchedVehiclesCount}</span>
            </div>
          </div>
          <RelativeTime
            date={incident.incidentTimestamp}
            className="shrink-0 text-muted-foreground text-xs first-letter:uppercase"
          />
        </div>
      </div>
    </Link>
  );
}

export function StationIncidentCardSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-lg bg-card">
      <div className="relative aspect-square w-24 shrink-0 p-1">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2 pr-3 pl-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}
