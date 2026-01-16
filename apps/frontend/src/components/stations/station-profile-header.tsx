import { Mail, Phone } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/api/client.gen";

interface StationProfileHeaderProps {
  station: {
    id: number;
    name: string;
    stationKey: string;
    radioChannel: string | null;
    latitude: string;
    longitude: string;
    address: string | null;
    phoneNumber: string | null;
    fax: string | null;
    email: string | null;
    isOperative: boolean | null;
  };
}

export function StationProfileHeader({ station }: StationProfileHeaderProps) {
  const baseUrl = client.getConfig().baseUrl ?? "";
  const imageUrl = `${baseUrl}/stations/${encodeURIComponent(station.stationKey)}/image`;

  return (
    <header>
      <div className="relative">
        <div className="aspect-4/3 w-full max-w-sm overflow-hidden rounded-xl bg-muted">
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-lg brightness-95"
          />
          <img
            src={imageUrl}
            alt={`Estación ${station.name}`}
            className="relative h-full w-full object-contain"
          />
        </div>
        <div className="absolute bottom-0 left-4 flex h-18 w-18 translate-y-1/2 items-center justify-center rounded-xl bg-primary font-mono text-2xl font-bold text-primary-foreground shadow-lg ring-4 ring-background sm:h-20 sm:w-20 sm:rounded-2xl sm:text-3xl">
          {station.stationKey}
        </div>
      </div>

      <div className="pt-14 sm:pt-16">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{station.name}</h1>
        {station.address && <p className="mt-1 text-sm text-muted-foreground">{station.address}</p>}

        {(station.phoneNumber || station.email) && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-medium text-muted-foreground">
            {station.phoneNumber && (
              <a
                href={`tel:${station.phoneNumber}`}
                className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                <Phone className="h-4 w-4" />
                {station.phoneNumber}
              </a>
            )}
            {station.email && (
              <a
                href={`mailto:${station.email}`}
                className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                <Mail className="h-4 w-4" />
                {station.email}
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export function StationProfileHeaderSkeleton() {
  return (
    <header>
      <div className="relative">
        <Skeleton className="aspect-4/3 w-full max-w-sm rounded-xl" />
        <Skeleton className="absolute bottom-0 left-4 h-18 w-18 translate-y-1/2 rounded-xl ring-4 ring-background sm:h-20 sm:w-20 sm:rounded-2xl" />
      </div>

      <div className="pt-14 sm:pt-16">
        <Skeleton className="h-9 w-64 sm:h-10" />
        <Skeleton className="mt-2 h-4 w-48" />
        <div className="mt-4 flex gap-x-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    </header>
  );
}
