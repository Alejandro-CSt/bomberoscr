import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * If the date is equal to 0001-01-01T00:00:00, it is considered undefined
 * @param date date to evaluate
 */
export function isUndefinedDate(date: string) {
  return date === "0001-01-01T00:00:00";
}

/**
 * Returns the relative time of a date, in spanish (es-CR) format.
 * @example getRelativeTime("2025-01-31T13:26:48.000Z")) // "hace 6 días"
 * @param date date to evaluate
 */
export function getRelativeTime(date: string): string {
  const rtf = new Intl.RelativeTimeFormat("es-CR", { numeric: "auto" });

  const nowCR = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Costa_Rica" }));

  const thenUTC = new Date(date);
  const thenCR = new Date(thenUTC.getTime() + 6 * 60 * 60000);

  const diffInSeconds = (nowCR.getTime() - thenCR.getTime()) / 1000;

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-Math.round(diffInSeconds), "second");
  }

  const diffInMinutes = diffInSeconds / 60;
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(-Math.round(diffInMinutes), "minute");
  }

  const diffInHours = diffInMinutes / 60;
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(-Math.round(diffInHours), "hour");
  }

  const diffInDays = diffInHours / 24;
  return rtf.format(-Math.round(diffInDays), "day");
}
