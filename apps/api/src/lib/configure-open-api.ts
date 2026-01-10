import { Scalar } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "@/lib/types";

const BASE_PATH = "/bomberos/hono";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Bomberos CR API"
    },
    servers: [
      {
        url: BASE_PATH,
        description: "Bomberos CR API"
      }
    ]
  });

  app.get(
    "/",
    Scalar({
      url: `${BASE_PATH}/doc`,
      theme: "laserwave",
      layout: "modern",
      defaultOpenAllTags: true,
      hideClientButton: true,
      defaultHttpClient: {
        targetKey: "shell",
        clientKey: "curl"
      }
    })
  );
}
