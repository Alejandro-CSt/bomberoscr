import { createRouter } from "@/lib/create-app";

import * as handlers from "@/routes/stations/stations.handlers";
import * as routes from "@/routes/stations/stations.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.getImageOriginal, handlers.getImageOriginal)
  .openapi(routes.getImage, handlers.getImage);

export default router;
