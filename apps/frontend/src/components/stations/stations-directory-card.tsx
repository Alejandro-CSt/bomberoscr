import { Link } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/api/client.gen";
import { cn } from "@/lib/utils";

interface StationsDirectoryCardProps {
  station: {
    name: string;
    stationKey: string;
    address: string | null;
  };
}

export function StationsDirectoryCard({ station }: StationsDirectoryCardProps) {
  const baseUrl = client.getConfig().baseUrl ?? "";
  const imageUrl = `${baseUrl}/stations/${encodeURIComponent(station.stationKey)}/image`;

  return (
    <Link
      to="/estaciones/$name"
      params={{ name: station.name }}
      className="group">
      <article className="rounded-xl bg-card shadow-md hover:shadow-xl">
        <div className="relative">
          <div className="aspect-3/2 w-full overflow-hidden rounded-t-xl bg-muted">
            <img
              src={imageUrl}
              alt={`Estación ${station.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="absolute bottom-0 left-5 flex h-10 w-10 translate-y-1/2 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground ring-4 ring-card">
            {station.stationKey}
          </div>
        </div>
        <div className="px-5 pt-7 pb-5">
          <h3 className="text-lg leading-tight font-bold tracking-tight text-foreground group-hover:text-primary">
            {station.name}
          </h3>
          {station.address && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
              {station.address}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

export function StationsDirectoryCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl bg-card shadow-md", className)}>
      <div className="relative">
        <Skeleton className="aspect-3/2 w-full rounded-t-xl" />
        <Skeleton className="absolute bottom-0 left-5 h-10 w-10 translate-y-1/2 rounded-full ring-4 ring-card" />
      </div>
      <div className="px-5 pt-7 pb-5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
      </div>
    </div>
  );
}
