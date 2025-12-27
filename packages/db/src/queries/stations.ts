import { asc, db, eq } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";

export type StationDirectory = {
  id: number;
  name: string;
  stationKey: string;
  address: string | null;
  isOperative: boolean | null;
};

export async function getStationsForDirectory(): Promise<StationDirectory[]> {
  const rows = await db.query.stations.findMany({
    columns: {
      id: true,
      name: true,
      stationKey: true,
      address: true,
      isOperative: true
    },
    where: eq(stations.isOperative, true),
    orderBy: asc(stations.name)
  });
  return rows;
}
