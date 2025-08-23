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
export function isUndefinedDate(date: Date) {
  return date.getFullYear() === 1;
}

/**
 * Returns the relative time of a date in Spanish (es-CR) format.
 *
 * @param date - ISO string or date to evaluate.
 * @param reference - Optional fixed "current" time.  When omitted, `new Date()` is used.
 *
 * @example
 * getRelativeTime("2025-01-31T13:26:48.000Z")
 * "hace 6 días"
 *
 * @example
 * getRelativeTime("2025-01-31T13:26:48.000Z", new Date("2025-02-01T13:26:48.000Z"))
 * "hace 1 día"
 */
export function getRelativeTime(date: string, reference?: Date): string {
  const rtf = new Intl.RelativeTimeFormat("es-CR", { numeric: "auto" });
  const now = reference ?? new Date();
  const then = new Date(date);

  const diffInSeconds = (now.getTime() - then.getTime()) / 1000;

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

/**
 * https://github.com/aceakash/string-similarity/blob/master/src/index.js
 * Compares two strings and returns a similarity score between 0 and 1.
 * @param string1 - The first string to compare.
 * @param string2 - The second string to compare.
 * @returns A number between 0 and 1 representing the similarity score.
 */
export function compareTwoStrings(string1: string, string2: string) {
  const first = string1.replace(/\s+/g, "");
  const second = string2.replace(/\s+/g, "");

  if (first === second) return 1; // identical or empty
  if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

  const firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

/**
 * Converts a duration expressed in seconds into a human-readable string
 * formatted as "HHh MMm SSs".
 *
 * @example
 * formatSecondsToHMS(0)        // "0s"
 * formatSecondsToHMS(45)       // "45s"
 * formatSecondsToHMS(125)      // "2m 5s"
 * formatSecondsToHMS(3665)     // "1h 1m 5s"
 *
 * @param totalSeconds - The duration in seconds to format.
 * @returns A string containing hours, minutes and seconds, omitting any
 * zero-value components except when the total is zero.
 */
export function formatSecondsToHMS(totalSeconds: number): string {
  if (totalSeconds === 0) {
    return "0s";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formattedTime = "";
  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0 || hours > 0) {
    formattedTime += `${minutes}m `;
  }
  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    formattedTime += `${seconds}s`;
  }

  return formattedTime.trim();
}

/**
 * Converts a duration expressed in minutes (including fractional minutes) into a human-readable string
 * formatted as "HHh MMm SSs".
 *
 * @example
 * formatMinutesToHMS(0)        // "0s"
 * formatMinutesToHMS(1.5)      // "1m 30s"
 * formatMinutesToHMS(125)      // "2h 5m 0s"
 * formatMinutesToHMS(61.1)     // "1h 1m 6s"
 *
 * @param totalMinutes - The duration in minutes to format.
 * @returns A string containing hours, minutes and seconds, omitting any
 * zero-value components except when the total is zero.
 */
export function formatMinutesToHMS(totalMinutes: number): string {
  if (totalMinutes === 0) {
    return "0s";
  }

  const totalMinutesFloor = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - totalMinutesFloor) * 60);
  const hours = Math.floor(totalMinutesFloor / 60);
  const minutes = totalMinutesFloor % 60;

  let formattedTime = "";
  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0 || hours > 0) {
    formattedTime += `${minutes}m `;
  }
  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    formattedTime += `${seconds}s`;
  }

  return formattedTime.trim();
}
