import { createRouter } from "@/lib/create-app";
import { handler as getOneHandler, route as getOneRoute } from "@/routes/incidents/[id]";
import { handler as mapHandler, route as mapRoute } from "@/routes/incidents/[id]/map";
import {
  handler as mapOriginalHandler,
  route as mapOriginalRoute
} from "@/routes/incidents/[id]/map/original";
import { handler as ogHandler, route as ogRoute } from "@/routes/incidents/[id]/og";
import {
  handler as responseTimesHandler,
  route as responseTimesRoute
} from "@/routes/incidents/[id]/response-times";
import {
  handler as timelineHandler,
  route as timelineRoute
} from "@/routes/incidents/[id]/timeline";
import {
  handler as highlightedHandler,
  route as highlightedRoute
} from "@/routes/incidents/highlighted";
import { handler as listHandler, route as listRoute } from "@/routes/incidents/index";
import {
  handler as typeImageHandler,
  route as typeImageRoute
} from "@/routes/incidents/types/[code]/image";
import {
  handler as typeImageOriginalHandler,
  route as typeImageOriginalRoute
} from "@/routes/incidents/types/[code]/image/original";

const router = createRouter()
  .openapi(listRoute, listHandler)
  .openapi(highlightedRoute, highlightedHandler)
  .openapi(getOneRoute, getOneHandler)
  .openapi(timelineRoute, timelineHandler)
  .openapi(responseTimesRoute, responseTimesHandler)
  .openapi(ogRoute, ogHandler)
  .openapi(mapOriginalRoute, mapOriginalHandler)
  .openapi(mapRoute, mapHandler)
  .openapi(typeImageOriginalRoute, typeImageOriginalHandler)
  .openapi(typeImageRoute, typeImageHandler);

export default router;
