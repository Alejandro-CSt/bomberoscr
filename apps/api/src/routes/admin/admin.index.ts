import { createRouter } from "@/lib/create-app";
import { adminAuth } from "@/middlewares/admin-auth";

import * as handlers from "@/routes/admin/admin.handlers";
import * as routes from "@/routes/admin/admin.routes";

const router = createRouter();

router.use("/admin/*", adminAuth);

router
  .openapi(routes.listIncidents, handlers.listIncidents)
  .openapi(routes.syncIncidents, handlers.syncIncidents)
  .openapi(routes.syncIncident, handlers.syncIncident);

export default router;
