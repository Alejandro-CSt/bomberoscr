import { drizzle } from "drizzle-orm/node-postgres";
import env from "./env";
import * as schema from "./schema";

export const db = drizzle(env.DRIZZLE_POSTGRES_URL, {
  schema
});

export type db = typeof db;

export default db;
