import { asc, db, eq } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";

export type OperativeStationBasic = {
  id: number;
  name: string;
};

export async function getOperativeStations(): Promise<OperativeStationBasic[]> {
  const rows = await db.query.stations.findMany({
    where: eq(stations.isOperative, true),
    columns: {
      id: true,
      name: true
    },
    orderBy: asc(stations.id)
  });
  return rows.map((r) => ({ id: r.id, name: r.name }));
}
