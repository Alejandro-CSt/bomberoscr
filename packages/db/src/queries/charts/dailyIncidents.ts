import { db } from "@bomberoscr/db/index";
import { incidents } from "@bomberoscr/db/schema";
import {
  DEFAULT_TIME_RANGE,
  type TimeRangeInput,
  timeRangeInputSchema
} from "@bomberoscr/lib/time-range";
import { sql } from "drizzle-orm";

export async function getDailyIncidents(input: TimeRangeInput = { timeRange: DEFAULT_TIME_RANGE }) {
  const { timeRange } = timeRangeInputSchema.parse(input);

  const currentEndDate = new Date();
  currentEndDate.setHours(23, 59, 59, 999);

  const currentStartDate = new Date(currentEndDate);
  currentStartDate.setDate(currentStartDate.getDate() - (timeRange - 1));
  currentStartDate.setHours(0, 0, 0, 0);

  const previousEndDate = new Date(currentStartDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);
  previousEndDate.setHours(23, 59, 59, 999);

  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - (timeRange - 1));
  previousStartDate.setHours(0, 0, 0, 0);

  const currentPeriod = await db
    .select({
      date: sql<string>`DATE(${incidents.incidentTimestamp})`,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${currentStartDate} AND ${currentEndDate}`)
    .groupBy(sql`DATE(${incidents.incidentTimestamp})`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp})`);

  const previousPeriod = await db
    .select({
      date: sql<string>`DATE(${incidents.incidentTimestamp})`,
      count: sql<number>`count(*)::int`
    })
    .from(incidents)
    .where(sql`${incidents.incidentTimestamp} BETWEEN ${previousStartDate} AND ${previousEndDate}`)
    .groupBy(sql`DATE(${incidents.incidentTimestamp})`)
    .orderBy(sql`DATE(${incidents.incidentTimestamp})`);

  const fillMissingDates = (data: typeof currentPeriod, startDate: Date, endDate: Date) => {
    const result = [];
    const current = new Date(startDate);

    const toLocalISOString = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    while (current <= endDate) {
      const dateStr = toLocalISOString(current);
      const existingData = data.find((d) => d.date === dateStr);

      result.push({
        date: dateStr,
        count: existingData ? Number(existingData.count) : 0
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  };

  const currentData = fillMissingDates(currentPeriod, currentStartDate, currentEndDate);
  const previousData = fillMissingDates(previousPeriod, previousStartDate, previousEndDate);

  const combinedData = currentData.map((current, index) => {
    const previous = previousData[index];
    const dayOffset = index + 1;

    return {
      date: current.date,
      dayOffset,
      current: current.count,
      previous: previous?.count || 0,
      displayDate: current.date
        ? new Date(`${current.date}T00:00:00`).toLocaleDateString("es-CR", {
            month: "short",
            day: "numeric",
            timeZone: "America/Costa_Rica"
          })
        : ""
    };
  });

  const currentTotal = currentData.reduce((sum, item) => sum + Number(item.count), 0);
  const previousTotal = previousData.reduce((sum, item) => sum + Number(item.count), 0);
  const percentageChange =
    previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  return {
    data: combinedData,
    summary: {
      currentTotal,
      previousTotal,
      percentageChange
    }
  };
}
