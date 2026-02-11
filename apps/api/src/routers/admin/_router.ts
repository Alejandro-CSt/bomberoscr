import { createRouter } from "@/lib/create-app";
import { adminAuth } from "@/middlewares/admin-auth";
import { listHandler, listRoute, syncHandler, syncRoute } from "@/routers/admin/incidents";
import {
  handler as syncSingleHandler,
  route as syncSingleRoute
} from "@/routers/admin/incidents/[id]";

const router = createRouter();

router.use("/admin/*", adminAuth);

router
  .openapi(listRoute, listHandler)
  .openapi(syncRoute, syncHandler)
  .openapi(syncSingleRoute, syncSingleHandler);

export default router;
