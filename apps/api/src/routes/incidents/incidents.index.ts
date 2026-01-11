import { createRouter } from "@/lib/create-app";

import * as handlers from "@/routes/incidents/incidents.handlers";
import * as routes from "@/routes/incidents/incidents.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.getOgImage, handlers.getOgImage)
  .openapi(routes.getMapImage, handlers.getMapImage);

export default router;
