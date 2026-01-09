import { createRouter } from "@/lib/create-app.js";

import * as handlers from "./incidents.handlers.js";
import * as routes from "./incidents.routes.js";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.geometry, handlers.geometry)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.getOgImage, handlers.getOgImage);

export default router;
