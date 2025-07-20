import { DailyIncidentsChart } from "@/features/homepage/components/daily-incidents-chart";
import { TopDispatchedStationsChart } from "@/features/homepage/components/top-stations-chart";
import { TopResponseTimesStationsChart } from "@/features/homepage/components/top-stations-response-time-chart";
import { getDailyIncidents } from "@bomberoscr/db/queries/charts/dailyIncidents";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { getTopResponseTimesStations } from "@bomberoscr/db/queries/charts/topResponseTimesStations";

export default async function Page() {
  const timeRange = 30;

  const [responseTimes, dispatchedStations, dailyIncidents] = await Promise.all([
    getTopResponseTimesStations({ timeRange: 30 }),
    getTopDispatchedStations({ timeRange: 30 }),
    getDailyIncidents({ timeRange })
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopDispatchedStationsChart stations={dispatchedStations} />
        <TopResponseTimesStationsChart stations={responseTimes} />
        <DailyIncidentsChart incidents={dailyIncidents} timeRange={timeRange} />
      </div>
    </div>
  );
}
