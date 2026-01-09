import configureOpenAPI from "@/lib/configure-open-api.js";
import createApp from "@/lib/create-app.js";
import incidents from "@/routes/incidents/incidents.index.js";

const app = createApp();

const api = createApp();

configureOpenAPI(api);

const routes = [incidents] as const;

for (const route of routes) {
  api.route("/", route);
}

app.route("/bomberos/hono", api);

export type AppType = (typeof routes)[number];

export default app;
