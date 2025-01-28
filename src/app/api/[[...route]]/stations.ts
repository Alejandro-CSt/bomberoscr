import db from "@/server/db";
import { stations } from "@/server/db/schema";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono()
  .get("/", async (c) => {
    const stations = await db.query.stations.findMany();
    return c.json(stations);
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
      const station = await db.query.stations.findFirst({
        where: eq(stations.id, validated.id)
      });
      if (!station) {
        return c.json({ error: "Station not found" }, 404);
      }
      return c.json(station);
    }
  );

export default app;
