import {
  type StationPageParams,
  findStationByName
} from "@/app/(max-w-6xl)/(subheader)/estaciones/[name]/page";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import { getStationCollaborations } from "@bomberoscr/db/queries/stations/collaborations";
import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CollaborationCardProps {
  station: {
    id: number;
    name: string;
    stationKey: string;
    collaborationCount: number;
  };
}

function CollaborationCard({ station }: CollaborationCardProps) {
  return (
    <Link
      href={`/estaciones/${encodeURIComponent(station.name)}`}
      className="group block overflow-hidden rounded-xl bg-card shadow-md transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-2/1 w-full bg-muted">
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
        <p className="line-clamp-2 text-foreground text-sm leading-relaxed">
          Trabajaron en conjunto en {station.collaborationCount.toLocaleString("es-CR")}{" "}
          {station.collaborationCount === 1 ? "incidente" : "incidentes"}.
        </p>
      </div>
    </Link>
  );
}

function CollaborationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm">
      <div className="relative">
        <Skeleton className="aspect-2/1 w-full rounded-none" />
        <Skeleton className="absolute bottom-0 left-5 h-10 w-10 translate-y-1/2 rounded-full ring-4 ring-card" />
      </div>
      <div className="flex flex-col gap-2 px-5 pt-7 pb-5">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-5 w-3/4 rounded-md" />
      </div>
    </div>
  );
}

export async function StationCollaborations({ params }: { params: StationPageParams }) {
  "use cache";
  cacheLife({ revalidate: 60 * 60, expire: 60 * 60 });

  const { name } = await params;
  const { station } = await findStationByName(name);

  if (!station) {
    notFound();
  }

  const collaborations = await getStationCollaborations({ stationId: station.id });

  if (collaborations.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-semibold text-lg">Incidentes conjuntos en el último mes</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collaborations.map((collab) => (
          <CollaborationCard key={collab.id} station={collab} />
        ))}
      </div>
    </section>
  );
}

export function StationCollaborationsSkeleton() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-semibold text-lg">Incidentes conjuntos en el último mes</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((key) => (
          <CollaborationCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}
