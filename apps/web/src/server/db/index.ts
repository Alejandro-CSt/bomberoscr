import * as schema from "@/server/db/schema";
import env from "@/server/env";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(env.DRIZZLE_POSTGRES_URL, {
  schema
});

export type db = typeof db;

export default db;
