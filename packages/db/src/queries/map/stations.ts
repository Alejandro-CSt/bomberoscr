import { db } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getStations(all: boolean) {
  return await db.query.stations.findMany({
    ...(!all && { where: eq(stations.isOperative, true) }),
    columns: {
      id: true,
      name: true,
      stationKey: true,
      longitude: true,
      latitude: true
    },
    orderBy: asc(stations.name)
  });
}

export async function getStationDetails(key: string) {
  return (
    (await db.query.stations.findFirst({
      where: eq(stations.stationKey, key)
    })) || null
  );
}
