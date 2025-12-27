import { Skeleton } from "@/features/shared/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

interface StationCardProps {
  station: {
    id: number;
    name: string;
    stationKey: string;
    address: string | null;
  };
}

export function StationCard({ station }: StationCardProps) {
  return (
    <Link
      href={`/estaciones/${encodeURIComponent(station.name)}`}
      className="group block overflow-hidden rounded-xl bg-card shadow-md transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-3/2 w-full bg-muted">
        <Image
          src={`/bomberos/estaciones/${encodeURIComponent(station.name)}/image`}
          alt={station.name}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute bottom-0 left-5 z-10 flex h-10 w-10 translate-y-1/2 items-center justify-center rounded-full bg-primary font-bold font-mono text-primary-foreground text-xs ring-4 ring-card">
          {station.stationKey}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-5 pt-7 pb-5">
        <h3 className="font-bold text-foreground text-lg leading-tight tracking-tight transition-colors group-hover:text-primary sm:line-clamp-1">
          {station.name}
        </h3>
        <p className="line-clamp-2 text-muted-foreground/80 text-sm leading-relaxed">
          {station.address ?? "Sin dirección"}
        </p>
      </div>
    </Link>
  );
}

export function StationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm">
      <div className="relative">
        <Skeleton className="aspect-3/2 w-full rounded-none" />
        <Skeleton className="absolute bottom-0 left-5 h-10 w-10 translate-y-1/2 rounded-full ring-4 ring-card" />
      </div>
      <div className="flex flex-col gap-2 px-5 pt-7 pb-5">
        <Skeleton className="h-6 w-40 rounded-md" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-3/4 rounded-md" />
        </div>
      </div>
    </div>
  );
}
