import { DailyIncidentsChart } from "@/features/dashboard/homepage/charts/components/daily-incidents-chart";
import { IncidentsByDayOfWeekChart } from "@/features/dashboard/homepage/charts/components/incidents-by-day-of-week-chart";
import { IncidentsByHourChart } from "@/features/dashboard/homepage/charts/components/incidents-by-hour-chart";
import { TopDispatchedStationsChart } from "@/features/dashboard/homepage/charts/components/top-stations-chart";
import { TopResponseTimesStationsChart } from "@/features/dashboard/homepage/charts/components/top-stations-response-time-chart";
import { MapCTA } from "@/features/dashboard/homepage/components/map-cta";
import { getDailyIncidents } from "@bomberoscr/db/queries/charts/dailyIncidents";
import { getIncidentsByDayOfWeek } from "@bomberoscr/db/queries/charts/incidentsByDayOfWeek";
import { getIncidentsByHour } from "@bomberoscr/db/queries/charts/incidentsByHour";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { getTopResponseTimesStations } from "@bomberoscr/db/queries/charts/topResponseTimesStations";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getCachedHomepageData = unstable_cache(
  async (timeRange: number) => {
    return await Promise.all([
      getTopResponseTimesStations({ timeRange }),
      getTopDispatchedStations({ timeRange }),
      getDailyIncidents({ timeRange }),
      getIncidentsByDayOfWeek({ timeRange }),
      getIncidentsByHour({ timeRange })
    ]);
  },
  ["homepage-data"],
  {
    revalidate: 60 * 10,
    tags: ["homepage"]
  }
);

export default async function Page() {
  const timeRange = 30;

  const [responseTimes, dispatchedStations, dailyIncidents, incidentsByDayOfWeek, incidentsByHour] =
    await getCachedHomepageData(timeRange);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 p-4">
      {/* <HighlightedIncidents /> */}
      <MapCTA />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopDispatchedStationsChart stations={dispatchedStations} />
        <TopResponseTimesStationsChart stations={responseTimes} />
        <IncidentsByDayOfWeekChart incidents={incidentsByDayOfWeek} timeRange={timeRange} />
        <IncidentsByHourChart incidents={incidentsByHour} timeRange={timeRange} />
        <DailyIncidentsChart incidents={dailyIncidents} timeRange={timeRange} />
      </div>
    </div>
  );
}
