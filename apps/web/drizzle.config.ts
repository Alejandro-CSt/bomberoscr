import env from "@/server/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DRIZZLE_POSTGRES_URL
  },
  verbose: true,
  strict: true
});
