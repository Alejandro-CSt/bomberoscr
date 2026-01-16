import { createRouter } from "@/lib/create-app";
import { handler as yearRecapHandler, route as yearRecapRoute } from "@/routes/stats/year-recap";

const router = createRouter().openapi(yearRecapRoute, yearRecapHandler);

export default router;
