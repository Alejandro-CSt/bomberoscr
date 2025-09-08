import { IncidentCard } from "@/features/map/incidents/components/incident-card";
import { ErrorPanel } from "@/features/map/layout/components/error-panel";
import { StationHeader } from "@/features/map/stations/components/station-header";
import db, { and, sql } from "@bomberoscr/db/index";
import { getLatestIncidents } from "@bomberoscr/db/queries/incidents";
import { stations } from "@bomberoscr/db/schema";
import type { Metadata, ResolvingMetadata } from "next";
import { unstable_cacheLife as cacheLife } from "next/cache";

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const decodedName = decodeURIComponent((await params).name).trim();
  const titleCaseName = decodedName
    .split(" ")
    .map((word) => {
      if (["de", "del", "la", "las", "los", "y", "e"].includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  const title = `Incidentes atendidos por la estación de ${titleCaseName}`;
  const description = `Detalles y estadísticas de incidentes atendidos por la estación de ${titleCaseName} de Bomberos de Costa Rica actualizados en tiempo real.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: (await parent).openGraph?.images,
      type: "website"
    },
    twitter: {
      title: title,
      description: description
    }
  };
}

async function getStation(name: string) {
  "use cache";
  cacheLife({ revalidate: 60 * 10, expire: 60 * 10 });
  return await db.query.stations.findFirst({
    where: and(sql`LOWER(TRIM(${stations.name})) = LOWER(${name})`)
  });
}

async function getLatestIncidentsQuery(stationKey: string) {
  "use cache";
  cacheLife({ revalidate: 60 * 10, expire: 60 * 10 });
  return await getLatestIncidents({
    stationFilter: stationKey,
    limit: 15,
    cursor: null
  });
}

export default async function DetailedStationPage({ params }: Props) {
  const decodedName = decodeURIComponent((await params).name).trim();

  const station = await getStation(decodedName);

  if (!station)
    return <ErrorPanel message="No se encontró la estación" backHref="/mapa/estaciones" />;

  const incidents = await getLatestIncidentsQuery(station.stationKey);

  return (
    <div className="flex flex-col py-2">
      <StationHeader station={{ name: station.name, stationKey: station.stationKey }} />
      <StationIncidents incidents={incidents} />
    </div>
  );
}

function StationIncidents({
  incidents
}: { incidents: Awaited<ReturnType<typeof getLatestIncidents>> }) {
  if (incidents.length === 0)
    return (
      <div className="flex-1">
        <p className="p-4 text-center text-muted-foreground">No se encontraron incidentes.</p>
      </div>
    );

  return (
    <div className="space-y-2 px-4 pt-2 pb-4">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
