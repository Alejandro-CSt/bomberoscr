// biome-ignore lint/performance/noBarrelFile: re-exporting to only have drizzle-orm installed in one package
export {
  aliasedTable,
  and,
  asc,
  between,
  count,
  desc,
  eq,
  inArray,
  isNull,
  lt,
  ne,
  not,
  or,
  sql
} from "drizzle-orm";
import * as schema from "@bomberoscr/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import env from "./env";

export const db = drizzle(env.DRIZZLE_POSTGRES_URL, {
  schema
});

export type db = typeof db;

export default db;
