import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import { and, between, eq, sql } from "drizzle-orm";

async function getIncidentStatistics(incident: {
  incidentTimestamp: Date;
  incidentCode: string | null;
  specificIncidentCode: string | null;
  cantonId: number | null;
  districtId: number | null;
}) {
  const year = incident.incidentTimestamp.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const incidentTimestamp = incident.incidentTimestamp;

  const incidentTypeCode = incident.specificIncidentCode || incident.incidentCode;
  const cantonId = incident.cantonId;
  const districtId = incident.districtId;

  const [typeInYear, typeInCanton, districtTotal, typePreviousYear] = await Promise.all([
    incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    cantonId && incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.cantonId, cantonId),
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    districtId
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.districtId, districtId),
              between(incidents.incidentTimestamp, startOfYear, incidentTimestamp)
            )
          )
      : Promise.resolve([{ count: 0 }]),

    incidentTypeCode
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(incidents)
          .where(
            and(
              eq(incidents.specificIncidentCode, incidentTypeCode),
              between(
                incidents.incidentTimestamp,
                new Date(year - 1, 0, 1),
                new Date(year - 1, 11, 31, 23, 59, 59)
              )
            )
          )
      : Promise.resolve([{ count: 0 }])
  ]);

  return {
    typeRankInYear: typeInYear[0]?.count ?? 0,
    typeRankInCanton: typeInCanton[0]?.count ?? 0,
    districtIncidentsThisYear: districtTotal[0]?.count ?? 0,
    typeCountPreviousYear: typePreviousYear[0]?.count ?? 0,
    year
  };
}

export { getIncidentStatistics };
export type IncidentStatistics = Awaited<ReturnType<typeof getIncidentStatistics>>;
