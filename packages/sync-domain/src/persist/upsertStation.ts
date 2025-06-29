import { db } from "@bomberoscr/db/db";
import { type stationsInsertSchema, stations as stationsTable } from "@bomberoscr/db/schema";
import { conflictUpdateSetAllColumns } from "@bomberoscr/db/utils";
import type { z } from "zod";

type Station = z.infer<typeof stationsInsertSchema>;

export async function upsertStation(stations: Station[]) {
  if (stations.length === 0) return;

  await db
    .insert(stationsTable)
    .values(stations)
    .onConflictDoUpdate({
      target: stationsTable.id,
      set: conflictUpdateSetAllColumns(stationsTable)
    });
}
