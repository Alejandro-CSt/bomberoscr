import {
  getDailyIncidents,
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
  dailyIncidentsRequest,
  dailyIncidentsResponse,
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
        year,
        totalIncidents: data.totalIncidents,
        frequency: data.frequency,
        busiestDate: data.busiestDate,
        busiestStation: data.busiestStation,
        busiestVehicle: data.busiestVehicle
          ? {
              internalNumber: data.busiestVehicle.internalNumber,
              count: data.busiestVehicle.count
            }
          : null,
        mostPopularIncidentType: data.mostPopularIncidentType
          ? {
              name: data.mostPopularIncidentType.name,
              count: data.mostPopularIncidentType.count
            }
          : null
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
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

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
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stations = await getTopResponseTimesStations({ startDate, endDate });

    return c.json(stations, HttpStatusCodes.OK);
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
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

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
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

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
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const incidents = await getDailyIncidents({ startDate, endDate });

    return c.json(incidents, HttpStatusCodes.OK);
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
