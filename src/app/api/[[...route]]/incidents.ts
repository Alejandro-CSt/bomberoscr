import db from "@/server/db";
import { dispatchedStations, incidents as incidentsTable } from "@/server/db/schema";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono()
  .get("/", async (c) => {
    const incidents = await db.query.incidents.findMany({
      limit: 15,
      orderBy: desc(incidentsTable.id)
    });
    return c.json(incidents);
  })
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number().positive()
      })
    ),
    async (c) => {
      const validated = c.req.valid("param");
      const incident = await db.query.incidents.findFirst({
        where: eq(incidentsTable.id, validated.id)
      });
      if (!incident) {
        return c.json({ error: "Incident not found" }, 404);
      }
      return c.json(incident);
    }
  )
  .get(
    "/station/:stationId",
    zValidator("param", z.object({ stationId: z.coerce.number().positive() })),
    async (c) => {
      const validated = c.req.valid("param");
      const incidents = await db
        .select({
          incident: incidentsTable
        })
        .from(dispatchedStations)
        .where(eq(dispatchedStations.stationId, validated.stationId))
        .leftJoin(incidentsTable, eq(incidentsTable.id, dispatchedStations.incidentId))
        .limit(10)
        .orderBy(desc(incidentsTable.id));
      return c.json(incidents);
    }
  );

export default app;
