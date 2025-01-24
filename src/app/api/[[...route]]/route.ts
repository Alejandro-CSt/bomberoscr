import env from "@/server/env";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import z from "zod";

const app = new Hono().basePath("/api");

app.post(
  "/sync",
  zValidator(
    "form",
    z.object({
      token: z.coerce.string()
    })
  ),
  (c) => {
    const validated = c.req.valid("form");
    if (validated.token !== env.SYNC_TOKEN) return c.json({ error: "Invalid token" }, 401);
    return c.newResponse("OK");
  }
);

export const GET = handle(app);
export const POST = handle(app);
