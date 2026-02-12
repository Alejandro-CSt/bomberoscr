import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import { healthRouter } from "@/routers/health";
import { incidentsRouter } from "@/routers/incidents";
import { stationsRouter } from "@/routers/stations";
import { statsRouter } from "@/routers/stats";
import { typesRouter } from "@/routers/types";

const app = createApp();

const api = createApp();

configureOpenAPI(api);

api.route("/health", healthRouter);
api.route("/incidents", incidentsRouter);
api.route("/stations", stationsRouter);
api.route("/stats", statsRouter);
api.route("/types", typesRouter);

app.route("/bomberos/hono", api);

export default app;
