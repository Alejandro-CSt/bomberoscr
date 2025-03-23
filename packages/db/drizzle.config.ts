import { defineConfig } from "drizzle-kit";
import env from "./src/env";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DRIZZLE_POSTGRES_URL
  },
  verbose: true,
  strict: true
});
