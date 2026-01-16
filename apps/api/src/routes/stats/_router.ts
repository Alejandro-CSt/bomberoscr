import { createRouter } from "@/lib/create-app";
import {
  handler as dailyIncidentsHandler,
  route as dailyIncidentsRoute
} from "@/routes/stats/daily-incidents";
import {
  handler as incidentsByDayOfWeekHandler,
  route as incidentsByDayOfWeekRoute
} from "@/routes/stats/incidents-by-day-of-week";
import {
  handler as incidentsByHourHandler,
  route as incidentsByHourRoute
} from "@/routes/stats/incidents-by-hour";
import {
  handler as systemOverviewHandler,
  route as systemOverviewRoute
} from "@/routes/stats/system-overview";
import {
  handler as topDispatchedStationsHandler,
  route as topDispatchedStationsRoute
} from "@/routes/stats/top-dispatched-stations";
import {
  handler as topResponseTimesHandler,
  route as topResponseTimesRoute
} from "@/routes/stats/top-response-times";
import { handler as yearRecapHandler, route as yearRecapRoute } from "@/routes/stats/year-recap";

const router = createRouter()
  .openapi(yearRecapRoute, yearRecapHandler)
  .openapi(topDispatchedStationsRoute, topDispatchedStationsHandler)
  .openapi(topResponseTimesRoute, topResponseTimesHandler)
  .openapi(incidentsByDayOfWeekRoute, incidentsByDayOfWeekHandler)
  .openapi(incidentsByHourRoute, incidentsByHourHandler)
  .openapi(dailyIncidentsRoute, dailyIncidentsHandler)
  .openapi(systemOverviewRoute, systemOverviewHandler);

export default router;
