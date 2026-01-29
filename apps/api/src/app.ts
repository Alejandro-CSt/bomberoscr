import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import { incidentsRouter } from "@/routers/incidents";
import { stationsRouter } from "@/routers/stations";
import { typesRouter } from "@/routers/types";

const app = createApp();

const api = createApp();

configureOpenAPI(api);

api.route("/incidents", incidentsRouter);
api.route("/stations", stationsRouter);
api.route("/types", typesRouter);

app.route("/bomberos/hono", api);

export type AppType = typeof incidentsRouter | typeof stationsRouter | typeof typesRouter;

export default app;
