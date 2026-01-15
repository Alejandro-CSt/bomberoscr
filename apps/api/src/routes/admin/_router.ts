import { createRouter } from "@/lib/create-app";
import { adminAuth } from "@/middlewares/admin-auth";
import { listHandler, listRoute, syncHandler, syncRoute } from "@/routes/admin/incidents";
import {
  handler as syncSingleHandler,
  route as syncSingleRoute
} from "@/routes/admin/incidents/[id]";

const router = createRouter();

router.use("/admin/*", adminAuth);

router
  .openapi(listRoute, listHandler)
  .openapi(syncRoute, syncHandler)
  .openapi(syncSingleRoute, syncSingleHandler);

export default router;
