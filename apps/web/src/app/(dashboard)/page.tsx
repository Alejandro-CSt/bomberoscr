import { DailyIncidentsChart } from "@/features/homepage/charts/components/daily-incidents-chart";
import { IncidentsByDayOfWeekChart } from "@/features/homepage/charts/components/incidents-by-day-of-week-chart";
import { IncidentsByHourChart } from "@/features/homepage/charts/components/incidents-by-hour-chart";
import { TopDispatchedStationsChart } from "@/features/homepage/charts/components/top-stations-chart";
import { TopResponseTimesStationsChart } from "@/features/homepage/charts/components/top-stations-response-time-chart";
import { getDailyIncidents } from "@bomberoscr/db/queries/charts/dailyIncidents";
import { getIncidentsByDayOfWeek } from "@bomberoscr/db/queries/charts/incidentsByDayOfWeek";
import { getIncidentsByHour } from "@bomberoscr/db/queries/charts/incidentsByHour";
import { getTopDispatchedStations } from "@bomberoscr/db/queries/charts/topDispatchedStations";
import { getTopResponseTimesStations } from "@bomberoscr/db/queries/charts/topResponseTimesStations";

export default async function Page() {
  const timeRange = 30;

  const [responseTimes, dispatchedStations, dailyIncidents, incidentsByDayOfWeek, incidentsByHour] =
    await Promise.all([
      getTopResponseTimesStations({ timeRange }),
      getTopDispatchedStations({ timeRange }),
      getDailyIncidents({ timeRange }),
      getIncidentsByDayOfWeek({ timeRange }),
      getIncidentsByHour({ timeRange })
    ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col p-4">
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
