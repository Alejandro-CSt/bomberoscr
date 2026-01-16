import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import admin from "@/routes/admin/_router";
import incidents from "@/routes/incidents/_router";
import stations from "@/routes/stations/_router";
import stats from "@/routes/stats/_router";

const app = createApp();

const api = createApp();

configureOpenAPI(api);

const routes = [incidents, stations, admin, stats] as const;

for (const route of routes) {
  api.route("/", route);
}

app.route("/bomberos/hono", api);

export type AppType = (typeof routes)[number];

export default app;
