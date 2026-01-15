import { createRouter } from "@/lib/create-app";
import { handler as getOneHandler, route as getOneRoute } from "@/routes/stations/[key]";
import { handler as imageHandler, route as imageRoute } from "@/routes/stations/[key]/image";
import {
  handler as imageOriginalHandler,
  route as imageOriginalRoute
} from "@/routes/stations/[key]/image/original";
import { handler as listHandler, route as listRoute } from "@/routes/stations/index";

const router = createRouter()
  .openapi(listRoute, listHandler)
  .openapi(getOneRoute, getOneHandler)
  .openapi(imageOriginalRoute, imageOriginalHandler)
  .openapi(imageRoute, imageHandler);

export default router;
