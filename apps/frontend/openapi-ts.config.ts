import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:9998/bomberos/hono/doc",
  output: {
    path: "src/lib/api/",
    postProcess: ["oxlint"]
  },
  plugins: ["@hey-api/typescript", "@hey-api/sdk", "@tanstack/react-query"]
});
