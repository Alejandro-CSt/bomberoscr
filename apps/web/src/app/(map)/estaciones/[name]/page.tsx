import { StationTabs } from "@/map/layout/components/station-tabs";
import { StationResume } from "@/map/stations/components/station-resume";
import { getLatestIncidents } from "@/server/queries";
import { ErrorPanel } from "@/shared/components/error-panel";
import { IncidentCard } from "@/shared/components/incident-card";
import db from "@bomberoscr/db/db";
import { stations } from "@bomberoscr/db/schema";
import { and, sql } from "drizzle-orm";
import type { Metadata, ResolvingMetadata } from "next";

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

export default async function DetailedStationPage({ params }: Props) {
  const decodedName = decodeURIComponent((await params).name).trim();

  const station = await db.query.stations.findFirst({
    where: and(sql`LOWER(TRIM(${stations.name})) = LOWER(${decodedName})`)
  });

  if (!station)
    return (
      <ErrorPanel
        title="Detalles de la estación"
        message="No se encontró la estación"
        backHref="/estaciones"
      />
    );

  const incidents = await getLatestIncidents({
    stationFilter: station.stationKey,
    limit: 15,
    cursor: null
  });

  return (
    <div className="flex flex-col py-2">
      <StationResume station={{ name: station.name, stationKey: station.stationKey }} />
      <StationTabs name={station.name} />
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
    <div className="space-y-2 px-4 pb-4">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
