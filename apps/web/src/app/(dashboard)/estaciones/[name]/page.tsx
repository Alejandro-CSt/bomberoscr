import db, { eq } from "@bomberoscr/db/index";
import { stations } from "@bomberoscr/db/schema";
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function StationContent(props: PageProps<"/estaciones/[name]">) {
  "use cache";
  cacheLife({ revalidate: 60 * 10, expire: 60 * 10 });
  const decodedName = decodeURIComponent((await props.params).name).trim();
  const station = await db.query.stations.findFirst({
    where: eq(stations.name, decodedName.toUpperCase())
  });
  return (
    <div className="mx-auto max-w-5xl">
      {Date.now()}Estación {station?.address}
    </div>
  );
}
