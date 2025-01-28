import db from "@/server/db";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations as stationsTable,
  vehicleDisponibility,
  vehicles
} from "@/server/db/schema";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import incidentsRouter from "./incidents";
import stationsRouter from "./stations";

const app = new Hono().basePath("/api");

app.get("/healthcheck", async (c) => {
  const vehiclesCount = await db.$count(vehicles);
  const vehicleDisponibilityCount = await db.$count(vehicleDisponibility);
  const vehiclesDispatchedCount = await db.$count(dispatchedVehicles);
  const incidentTypesCount = await db.$count(incidentTypes);
  const incidentsCount = await db.$count(incidents);
  const stationsCount = await db.$count(stationsTable);
  const dispatchedStationCount = await db.$count(dispatchedStations);

  return c.json({
    vehiclesCount,
    vehicleDisponibilityCount,
    vehiclesDispatchedCount,
    incidentTypesCount,
    incidentsCount,
    stationsCount,
    dispatchedStationCount
  });
});

const routes = app.route("/stations", stationsRouter).route("/incidents", incidentsRouter);

export const GET = handle(app);

export type AppType = typeof routes;
