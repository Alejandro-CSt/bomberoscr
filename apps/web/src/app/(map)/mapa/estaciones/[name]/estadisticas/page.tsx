import { StationTabs } from "@/features/map/layout/components/station-tabs";
import { StationStats } from "@/features/map/stations/components/station-stats";
import { StationSummary } from "@/features/map/stations/components/station-summary";
import { ErrorPanel } from "@/features/shared/components/error-panel";
import db, { and, sql } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { unstable_cacheLife as cacheLife } from "next/cache";

async function getStation(name: string) {
  "use cache";
  cacheLife({ revalidate: 60 * 10, expire: 60 * 10 });
  return await db.query.stations.findFirst({
    where: and(sql`LOWER(TRIM(${stations.name})) = LOWER(${name})`)
  });
}

export default async function StationIncidents({
  params
}: {
  params: Promise<{ name: string }>;
}) {
  const decodedName = decodeURIComponent((await params).name).trim();

  const station = await getStation(decodedName);

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
