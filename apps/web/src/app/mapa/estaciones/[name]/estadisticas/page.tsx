import { ErrorPanel } from "@/features/map/layout/components/error-panel";
import { StationHeader } from "@/features/map/stations/components/station-header";
import { StationStats } from "@/features/map/stations/components/station-stats";
import db, { and, sql } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { cacheLife } from "next/cache";

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
      <StationHeader station={{ name: station.name, stationKey: station.stationKey }} />
      <StationStats stationKey={station.stationKey} />
    </div>
  );
}
