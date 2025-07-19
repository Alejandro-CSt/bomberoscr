import { TopDispatchedStationsChart } from "@/features/homepage/components/top-stations-chart";
import { TopResponseTimesStationsChart } from "@/features/homepage/components/top-stations-response-time-chart";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { getTopResponseTimesStations } from "@bomberoscr/db/queries/charts/topResponseTimesStations";

export default async function Page() {
  const [responseTimes, dispatchedStations] = await Promise.all([
    getTopResponseTimesStations({ timeRange: 365 }),
    getTopDispatchedStations({ timeRange: 365 })
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopDispatchedStationsChart stations={dispatchedStations} />
        <TopResponseTimesStationsChart stations={responseTimes} />
      </div>
    </div>
  );
}
