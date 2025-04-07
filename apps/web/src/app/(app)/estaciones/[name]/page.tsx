import { ErrorPanel } from "@/features/components/error-panel";
import { IncidentCard } from "@/features/components/incident-card";
import { StationTabs } from "@/features/layout/components/station-tabs";
import { StationResume } from "@/features/stations/station-resume";
import { getLatestIncidents } from "@/server/queries";
import db from "@bomberoscr/db/db";
import { stations } from "@bomberoscr/db/schema";
import { and, sql } from "drizzle-orm";

export default async function DetailedStationPage({
  params
}: {
  params: Promise<{ name: string }>;
}) {
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
