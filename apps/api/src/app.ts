import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import admin from "@/routes/admin/admin.index";
import incidents from "@/routes/incidents/incidents.index";
import stations from "@/routes/stations/stations.index";

const app = createApp();

const api = createApp();

configureOpenAPI(api);

const routes = [incidents, stations, admin] as const;

for (const route of routes) {
  api.route("/", route);
}

app.route("/bomberos/hono", api);

export type AppType = (typeof routes)[number];

export default app;
