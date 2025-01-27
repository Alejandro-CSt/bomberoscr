import db from "@/server/db";
import {
  dispatchedStations,
  dispatchedVehicles,
  incidentTypes,
  incidents,
  stations,
  vehicleDisponibility,
  vehicles
} from "@/server/db/schema";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.get("/healthcheck", async (c) => {
  const vehiclesCount = await db.$count(vehicles);
  const vehicleDisponibilityCount = await db.$count(vehicleDisponibility);
  const vehiclesDispatchedCount = await db.$count(dispatchedVehicles);
  const incidentTypesCount = await db.$count(incidentTypes);
  const incidentsCount = await db.$count(incidents);
  const stationsCount = await db.$count(stations);
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

export const GET = handle(app);
