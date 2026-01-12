import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import env from "@/env";
import { pinoLogger } from "@/middlewares/pino-logger";

import type { AppBindings, AppOpenAPI } from "@/lib/types";
import type { Schema } from "hono";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook
  });
}

export default function createApp() {
  const app = createRouter();
  const allowedOrigins = new Set([env.SITE_URL, "http://localhost:3000"]);

  app
    .use(
      cors({
        origin: (origin) => {
          if (!origin) return undefined;
          return allowedOrigins.has(origin) ? origin : undefined;
        }
      })
    )
    .use(requestId())
    .use(serveEmojiFavicon("🚒"))
    .use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);
  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
