import { OpenAPIHono } from "@hono/zod-openapi";

import { generateMainPageOgImage } from "@/lib/utils/main-page-og-image";

const app = new OpenAPIHono();

app.get("/", async () => {
  const response = await generateMainPageOgImage();
  response.headers.set("Cache-Control", "public, max-age=604800, s-maxage=604800");
  return response;
});

export const ogRouter = app;
