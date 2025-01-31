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
 * @example getRelativeTime(new Date("2025-01-01T00:00:00")) // "hace 1 mes"
 * @param date date to evaluate
 */
export function getRelativeTime(date: Date): string {
  date.setHours(date.getHours() + 6);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const formatter = new Intl.RelativeTimeFormat("es-CR", { numeric: "auto" });

  const seconds = Math.abs(diffInSecs);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return formatter.format(-days, "day");
  if (hours > 0) return formatter.format(-hours, "hour");
  if (minutes > 0) return formatter.format(-minutes, "minute");
  return formatter.format(-seconds, "second");
}
