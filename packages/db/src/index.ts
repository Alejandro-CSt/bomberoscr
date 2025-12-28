// biome-ignore lint/performance/noBarrelFile: re-exporting to only have drizzle-orm installed in one package
export {
  aliasedTable,
  and,
  asc,
  between,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  like,
  lt,
  gte,
  ne,
  not,
  or,
  sql
} from "drizzle-orm";
import * as schema from "@bomberoscr/db/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import env from "./env";

export const db: NodePgDatabase<typeof schema> = drizzle(env.DRIZZLE_POSTGRES_URL, {
  schema
});

export type Db = typeof db;

export default db;
