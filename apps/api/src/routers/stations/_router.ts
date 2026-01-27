import { createRouter } from "@/lib/create-app";
import { handler as getOneHandler, route as getOneRoute } from "@/routers/stations/[key]";
import {
  handler as collaborationsHandler,
  route as collaborationsRoute
} from "@/routers/stations/[key]/collaborations";
import { handler as heatmapHandler, route as heatmapRoute } from "@/routers/stations/[key]/heatmap";
import {
  handler as highlightedIncidentsHandler,
  route as highlightedIncidentsRoute
} from "@/routers/stations/[key]/highlighted-incidents";
import { handler as imageHandler, route as imageRoute } from "@/routers/stations/[key]/image";
import {
  handler as imageOriginalHandler,
  route as imageOriginalRoute
} from "@/routers/stations/[key]/image/original";
import {
  handler as recentIncidentsHandler,
  route as recentIncidentsRoute
} from "@/routers/stations/[key]/recent-incidents";
import {
  handler as vehiclesHandler,
  route as vehiclesRoute
} from "@/routers/stations/[key]/vehicles";
import {
  handler as getByNameHandler,
  route as getByNameRoute
} from "@/routers/stations/by-name/[name]";
import { handler as listHandler, route as listRoute } from "@/routers/stations/index";

const router = createRouter()
  .openapi(listRoute, listHandler)
  .openapi(getOneRoute, getOneHandler)
  .openapi(highlightedIncidentsRoute, highlightedIncidentsHandler)
  .openapi(heatmapRoute, heatmapHandler)
  .openapi(recentIncidentsRoute, recentIncidentsHandler)
  .openapi(collaborationsRoute, collaborationsHandler)
  .openapi(vehiclesRoute, vehiclesHandler)
  .openapi(getByNameRoute, getByNameHandler)
  .openapi(imageOriginalRoute, imageOriginalHandler)
  .openapi(imageRoute, imageHandler);

export default router;
