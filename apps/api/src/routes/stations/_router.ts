import { createRouter } from "@/lib/create-app";
import { handler as getOneHandler, route as getOneRoute } from "@/routes/stations/[key]";
import {
  handler as collaborationsHandler,
  route as collaborationsRoute
} from "@/routes/stations/[key]/collaborations";
import { handler as heatmapHandler, route as heatmapRoute } from "@/routes/stations/[key]/heatmap";
import {
  handler as highlightedIncidentsHandler,
  route as highlightedIncidentsRoute
} from "@/routes/stations/[key]/highlighted-incidents";
import { handler as imageHandler, route as imageRoute } from "@/routes/stations/[key]/image";
import {
  handler as imageOriginalHandler,
  route as imageOriginalRoute
} from "@/routes/stations/[key]/image/original";
import {
  handler as recentIncidentsHandler,
  route as recentIncidentsRoute
} from "@/routes/stations/[key]/recent-incidents";
import {
  handler as vehiclesHandler,
  route as vehiclesRoute
} from "@/routes/stations/[key]/vehicles";
import {
  handler as getByNameHandler,
  route as getByNameRoute
} from "@/routes/stations/by-name/[name]";
import { handler as listHandler, route as listRoute } from "@/routes/stations/index";

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
