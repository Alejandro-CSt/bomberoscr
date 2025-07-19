import { TopDispatchedStationsChart } from "@/features/homepage/components/top-stations-chart";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";

export default async function Page() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopDispatchedStationsChart stations={await getTopDispatchedStations({ timeRange: 365 })} />
      </div>
    </div>
  );
}
