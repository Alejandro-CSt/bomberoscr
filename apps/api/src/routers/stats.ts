import {
  getDailyIncidents,
  getDailyResponseTimes,
  getIncidentsByType,
  getIncidentsByDayOfWeek,
  getIncidentsByHour,
  getSystemOverview,
  getTopDispatchedStations,
  getTopResponseTimesStations,
  getYearRecap
} from "@bomberoscr/db/queries/stats";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import {
  dailyResponseTimesRequest,
  dailyResponseTimesResponse,
  dailyIncidentsRequest,
  dailyIncidentsResponse,
  incidentsByTypeRequest,
  incidentsByTypeResponse,
  incidentsByDayOfWeekRequest,
  incidentsByDayOfWeekResponse,
  incidentsByHourRequest,
  incidentsByHourResponse,
  systemOverviewResponse,
  topDispatchedStationsRequest,
  topDispatchedStationsResponse,
  topResponseTimesRequest,
  topResponseTimesResponse,
  yearRecapRequest,
  yearRecapResponse
} from "@/schemas/stats";

const app = new OpenAPIHono();

const DEFAULT_RANGE_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ONE_MINUTE_SECONDS = 60;
const COSTA_RICA_TIME_ZONE = "America/Costa_Rica";
const COSTA_RICA_UTC_OFFSET = "-06:00";

function buildCacheControlHeader(ttlSeconds: number, swrSeconds: number = ttlSeconds): string {
  return `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}, stale-while-revalidate=${swrSeconds}`;
}

function parseIsoDateTime(value: string): Date {
  return new Date(value);
}

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(date);

  return {
    year: parts.find((part) => part.type === "year")?.value,
    month: parts.find((part) => part.type === "month")?.value,
    day: parts.find((part) => part.type === "day")?.value
  };
}

function getCostaRicaMidnight(date: Date): Date {
  const { year, month, day } = getDatePartsInTimeZone(date, COSTA_RICA_TIME_ZONE);

  return new Date(`${year}-${month}-${day}T00:00:00${COSTA_RICA_UTC_OFFSET}`);
}

function resolveDateRange(start: string | null | undefined, end: string | null | undefined) {
  const endDate = end ? parseIsoDateTime(end) : new Date();
  const startDate = start
    ? parseIsoDateTime(start)
    : new Date(endDate.getTime() - DEFAULT_RANGE_DAYS * DAY_IN_MS);

  return { startDate, endDate };
}

app.openapi(
  createRoute({
    method: "get",
    path: "/year-recap",
    summary: "Get year recap statistics",
    operationId: "getYearRecap",
    description: "Year-to-date statistics about emergency response",
    tags: ["Stats"],
    request: {
      query: yearRecapRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(yearRecapResponse, "Year recap statistics")
    }
  }),
  async (c) => {
    const { year } = c.req.valid("query");

    const data = await getYearRecap(year);

    return c.json(
      {
        topIncidentDays: data.topIncidentDays,
        topDispatchedStations: data.topDispatchedStations,
        topDispatchedVehicles: data.topDispatchedVehicles
      },
      HttpStatusCodes.OK
    );
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/top-dispatched-stations",
    summary: "Get top dispatched stations",
    operationId: "getTopDispatchedStations",
    description: "Top dispatched stations by count",
    tags: ["Stats"],
    request: {
      query: topDispatchedStationsRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(topDispatchedStationsResponse, "Top dispatched stations")
    }
  }),
  async (c) => {
    const { start, end } = c.req.valid("query");
    const { startDate, endDate } = resolveDateRange(start, end);

    const stations = await getTopDispatchedStations({ startDate, endDate });

    return c.json(stations, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/top-response-times",
    summary: "Get station response time rankings",
    operationId: "getTopResponseTimes",
    description: "Station response time rankings (fastest, slowest, and national average)",
    tags: ["Stats"],
    request: {
      query: topResponseTimesRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(topResponseTimesResponse, "Response time rankings")
    }
  }),
  async (c) => {
    const { start, end } = c.req.valid("query");
    const { startDate, endDate } = resolveDateRange(start, end);

    const stations = await getTopResponseTimesStations({ startDate, endDate });

    return c.json(stations, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/incidents-by-type",
    summary: "Get incidents by type",
    operationId: "getIncidentsByType",
    description: "Incidents distribution by type with top N and 'Otros' grouping",
    tags: ["Stats"],
    request: {
      query: incidentsByTypeRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(incidentsByTypeResponse, "Incidents by type")
    }
  }),
  async (c) => {
    const { start, end, limit } = c.req.valid("query");
    const { startDate, endDate } = resolveDateRange(start, end);

    const incidents = await getIncidentsByType({ startDate, endDate, limit });

    return c.json(incidents, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/incidents-by-day-of-week",
    summary: "Get incidents by day of week",
    operationId: "getIncidentsByDayOfWeek",
    description: "Incidents distribution by day of week",
    tags: ["Stats"],
    request: {
      query: incidentsByDayOfWeekRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(incidentsByDayOfWeekResponse, "Incidents by day of week")
    }
  }),
  async (c) => {
    const { start, end } = c.req.valid("query");
    const { startDate, endDate } = resolveDateRange(start, end);

    const incidents = await getIncidentsByDayOfWeek({ startDate, endDate });

    return c.json(incidents, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/incidents-by-hour",
    summary: "Get incidents by hour",
    operationId: "getIncidentsByHour",
    description: "Incidents distribution by hour of day",
    tags: ["Stats"],
    request: {
      query: incidentsByHourRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(incidentsByHourResponse, "Incidents by hour")
    }
  }),
  async (c) => {
    const { start, end } = c.req.valid("query");
    const { startDate, endDate } = resolveDateRange(start, end);

    const incidents = await getIncidentsByHour({ startDate, endDate });

    return c.json(incidents, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/daily-incidents",
    summary: "Get daily incidents comparison",
    operationId: "getDailyIncidents",
    description: "Daily incidents comparison between current and previous period",
    tags: ["Stats"],
    request: {
      query: dailyIncidentsRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(dailyIncidentsResponse, "Daily incidents")
    }
  }),
  async (c) => {
    const { start, end } = c.req.valid("query");
    const { startDate, endDate } = resolveDateRange(start, end);

    const incidents = await getDailyIncidents({ startDate, endDate });

    return c.json(incidents, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/daily-response-times",
    summary: "Get daily response times",
    operationId: "getDailyResponseTimes",
    description: "Daily average response times for dispatched vehicles",
    tags: ["Stats"],
    request: {
      query: dailyResponseTimesRequest
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(dailyResponseTimesResponse, "Daily response times")
    }
  }),
  async (c) => {
    const { timeRange } = c.req.valid("query");

    const endDate = new Date();
    const startOfTodayCostaRica = getCostaRicaMidnight(endDate);
    const startDate = new Date(startOfTodayCostaRica.getTime() - (timeRange - 1) * DAY_IN_MS);

    const data = await getDailyResponseTimes({ startDate, endDate });
    const totalDispatches = data.reduce((sum, day) => sum + day.dispatchCount, 0);

    c.header("Cache-Control", buildCacheControlHeader(ONE_MINUTE_SECONDS));

    return c.json({ data, totalDispatches }, HttpStatusCodes.OK);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/system-overview",
    summary: "Get system overview",
    operationId: "getSystemOverview",
    description:
      "System-wide overview statistics including operative stations, active vehicles, and average response time over the last 30 days",
    tags: ["Stats"],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(systemOverviewResponse, "System overview statistics")
    }
  }),
  async (c) => {
    const data = await getSystemOverview();

    return c.json(
      {
        stationCount: data.stationCount,
        activeVehicleCount: data.activeVehicleCount,
        avgResponseTimeMinutes: data.avgResponseTimeMinutes
      },
      HttpStatusCodes.OK
    );
  }
);

export const statsRouter = app;
