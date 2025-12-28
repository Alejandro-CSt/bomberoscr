import {
  type StationPageParams,
  findStationByName
} from "@/app/(max-w-6xl)/(subheader)/estaciones/[name]/page";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { Mail, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function StationProfileHeader({ params }: { params: StationPageParams }) {
  "use cache";
  cacheLife({ revalidate: 60 * 60 * 24, expire: 60 * 60 * 24 });

  const { name } = await params;
  const { station } = await findStationByName(name);

  if (!station) {
    notFound();
  }

  const imageUrl = `/bomberos/estaciones/${encodeURIComponent(station.name)}/image`;

  return (
    <header>
      <div className="relative">
        <div className="aspect-4/3 w-full max-w-sm overflow-hidden rounded-xl bg-muted">
          <div className="relative h-full w-full">
            <Image
              src={imageUrl}
              alt=""
              fill
              aria-hidden="true"
              className="scale-110 object-cover blur-xl brightness-75"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <Image
              src={imageUrl}
              alt={`Estación ${station.name}`}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-4 z-10 flex h-18 w-18 translate-y-1/2 items-center justify-center rounded-xl bg-primary font-bold font-mono text-2xl text-primary-foreground shadow-lg ring-4 ring-background sm:h-20 sm:w-20 sm:rounded-2xl sm:text-3xl">
          {station.stationKey}
        </div>
      </div>

      <div className="pt-14 sm:pt-16">
        <h1 className="font-black text-3xl tracking-tight sm:text-4xl">{station.name}</h1>

        {station.address && <p className="mt-1 text-muted-foreground text-sm">{station.address}</p>}

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-medium text-muted-foreground">
          {station.phoneNumber && (
            <a
              href={`tel:${station.phoneNumber}`}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{station.phoneNumber}</span>
            </a>
          )}
          {station.email && (
            <a
              href={`mailto:${station.email}`}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>{station.email}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export function StationProfileHeaderSkeleton() {
  return (
    <div>
      <div className="relative">
        <Skeleton className="aspect-4/3 w-full max-w-sm rounded-xl" />
        <Skeleton className="absolute bottom-0 left-4 h-18 w-18 translate-y-1/2 rounded-xl ring-4 ring-background sm:h-20 sm:w-20 sm:rounded-2xl" />
      </div>

      <div className="pt-14 sm:pt-16">
        <Skeleton className="h-10 w-64 rounded-md sm:h-12" />
        <Skeleton className="mt-2 h-5 w-full max-w-md rounded-md" />
        <div className="mt-4 flex gap-5">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-5 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
}
