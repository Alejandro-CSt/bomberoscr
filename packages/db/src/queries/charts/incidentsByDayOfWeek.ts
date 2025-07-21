import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import {
  DEFAULT_TIME_RANGE,
  type TimeRangeInput,
  timeRangeInputSchema
} from "@bomberoscr/lib/time-range";
import { sql } from "drizzle-orm";

export async function getIncidentsByDayOfWeek(
  input: TimeRangeInput = { timeRange: DEFAULT_TIME_RANGE }
) {
  const { timeRange } = timeRangeInputSchema.parse(input);

  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  const dayOfWeekOrder = {
    Lunes: 0,
    Martes: 1,
    Miércoles: 2,
    Jueves: 3,
    Viernes: 4,
    Sábado: 5,
    Domingo: 6
  };

  const results = await db
    .select({
      dayOfWeek: sql<string>`
        CASE 
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 1 THEN 'Lunes'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 2 THEN 'Martes'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 3 THEN 'Miércoles'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 4 THEN 'Jueves'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 5 THEN 'Viernes'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 6 THEN 'Sábado'
          WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 0 THEN 'Domingo'
        END
      `,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${startDate} AND ${endDate}`)
    .groupBy(sql`
      CASE 
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 1 THEN 'Lunes'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 2 THEN 'Martes'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 3 THEN 'Miércoles'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 4 THEN 'Jueves'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 5 THEN 'Viernes'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 6 THEN 'Sábado'
        WHEN EXTRACT(DOW FROM ${incidents.incidentTimestamp}) = 0 THEN 'Domingo'
      END
    `);

  const sortedResults = Object.entries(dayOfWeekOrder)
    .map(([dayName, order]) => {
      const existing = results.find((r) => r.dayOfWeek === dayName);
      return {
        dayOfWeek: dayName,
        count: existing?.count || 0,
        order
      };
    })
    .sort((a, b) => a.order - b.order);

  return sortedResults.map(({ dayOfWeek, count }) => ({
    dayOfWeek,
    count
  }));
}
