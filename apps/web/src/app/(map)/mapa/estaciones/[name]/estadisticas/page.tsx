import { StationTabs } from "@/features/map/layout/components/station-tabs";
import { StationStats } from "@/features/map/stations/components/station-stats";
import { StationSummary } from "@/features/map/stations/components/station-summary";
import { ErrorPanel } from "@/shared/components/error-panel";
import db, { and, sql } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";

export default async function StationIncidents({
  params
}: {
  params: Promise<{ name: string }>;
}) {
  const decodedName = decodeURIComponent((await params).name).trim();

  const station = await db.query.stations.findFirst({
    where: and(sql`LOWER(TRIM(${stations.name})) = LOWER(${decodedName})`),
    columns: {
      name: true,
      stationKey: true
    }
  });

  if (!station)
    return (
      <ErrorPanel
        title="Detalles de la estación"
        message="No se encontró la estación"
        backHref="/estaciones"
      />
    );

  return (
    <div className="flex flex-col py-2">
      <StationSummary station={{ name: station.name, stationKey: station.stationKey }} />
      <StationTabs name={station.name} />
      <StationStats stationKey={station.stationKey} />
    </div>
  );
}
