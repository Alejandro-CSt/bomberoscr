import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Regex patterns for performance (defined at top level)
// biome-ignore lint/suspicious/noMisleadingCharacterClass: Unicode combining characters range is intentional for diacritic removal
const diacriticRegex = /[\u0300-\u036f]/g;
const specialCharRegex = /[^a-z0-9\s-]/g;
const locationPatternRegex = / EN [^,]+,/i;
const extractIdRegex = /\/incidentes\/(\d+)/;
const multipleHyphensRegex = /-+/g;
const multipleSpacesRegex = /\s+/g;

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
 * Uses rounded units (weeks, months, years) for older dates.
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
 *
 * @example
 * getRelativeTime("2024-07-01T00:00:00.000Z", new Date("2025-01-01T00:00:00.000Z"))
 * "hace 6 meses"
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
  if (Math.abs(diffInDays) < 7) {
    return rtf.format(-Math.round(diffInDays), "day");
  }

  const diffInWeeks = diffInDays / 7;
  if (Math.abs(diffInWeeks) < 4) {
    return rtf.format(-Math.round(diffInWeeks), "week");
  }

  const diffInMonths = diffInDays / 30;
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(-Math.round(diffInMonths), "month");
  }

  const diffInYears = diffInDays / 365;
  return rtf.format(-Math.round(diffInYears), "year");
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

/**
 * Converts a string to a URL-friendly slug.
 * Removes location information (EN ...), special characters, and formats for URLs.
 * Only removes location when "EN" is followed by a comma (indicating a place name).
 *
 * @example
 * createIncidentSlug("COLISION DE VEHICULO EN San José, Central, San José")
 * // "colision-de-vehiculo"
 *
 * @example
 * createIncidentSlug("RESCATE DE FELINO ATRAPADO EN MEDIO DE DOS PAREDES")
 * // "rescate-de-felino-atrapado-en-medio-de-dos-paredes"
 *
 * @example
 * createIncidentSlug("INCENDIO ESTRUCTURAL")
 * // "incendio-estructural"
 *
 * @param title - The incident title to convert to a slug.
 * @returns A URL-friendly slug without location information.
 */
export function createIncidentSlug(title: string): string {
  // Remove location part only if "EN" is followed by a comma pattern (e.g., "EN District, Canton, Province")
  // This preserves descriptions like "ATRAPADO EN MEDIO DE" while removing "EN San José, Central, San José"
  let titleWithoutLocation = title;

  if (locationPatternRegex.test(title)) {
    // Find the last occurrence of " EN " followed by comma-separated location
    const lastEnIndex = title.lastIndexOf(" EN ");
    if (lastEnIndex !== -1) {
      const afterEn = title.substring(lastEnIndex + 4);
      // Only remove if it contains a comma (location format)
      if (afterEn.includes(",")) {
        titleWithoutLocation = title.substring(0, lastEnIndex);
      }
    }
  }

  return titleWithoutLocation
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(diacriticRegex, "") // Remove diacritics
    .replace(specialCharRegex, "") // Remove special characters
    .trim()
    .replace(multipleSpacesRegex, "-") // Replace spaces with hyphens
    .replace(multipleHyphensRegex, "-"); // Replace multiple hyphens with single hyphen
}

/**
 * Builds a complete incident URL path in the format: /incidentes/{id}-{slug}-{yyyy-mm-dd}
 *
 * @example
 * buildIncidentUrl(1549092, "COLISION DE VEHICULO EN ...", new Date("2025-01-01"))
 * // "/incidentes/1549092-colision-de-vehiculo-2025-01-01"
 *
 * @param id - The incident ID.
 * @param title - The incident title.
 * @param date - The incident date.
 * @returns The complete URL path for the incident.
 */
export function buildIncidentUrl(id: number, title: string, date: Date): string {
  const slug = createIncidentSlug(title);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  return `/incidentes/${id}-${slug}-${dateString}`;
}

/**
 * Extracts the incident ID from a URL path.
 * Supports both old format (/incidentes/{id}) and new format (/incidentes/{id}-{slug}-{date})
 *
 * @example
 * extractIncidentId("/incidentes/1549092-colision-de-vehiculo-2025-01-01")
 * // 1549092
 *
 * @example
 * extractIncidentId("/incidentes/1549092")
 * // 1549092
 *
 * @param path - The URL path to extract the ID from.
 * @returns The incident ID or null if not found.
 */
export function extractIncidentId(path: string): number | null {
  const match = path.match(extractIdRegex);
  if (!match || !match[1]) return null;
  return Number.parseInt(match[1], 10);
}

/**
 * Builds an incident URL from partial incident data (for lists/cards).
 * This is a simplified version that works with data from list queries.
 *
 * @example
 * buildIncidentUrlFromPartial({ id: 1549092, incidentTimestamp: new Date("2025-01-01"), importantDetails: "COLISION DE VEHICULO", incidentType: "Colisión" })
 * // "/incidentes/1549092-colision-de-vehiculo-2025-01-01"
 *
 * @param incident - Partial incident data with at least id, incidentTimestamp, and some form of title
 * @returns The URL path for the incident
 */
export function buildIncidentUrlFromPartial(incident: {
  id: number;
  incidentTimestamp: Date;
  importantDetails?: string | null;
  specificIncidentType?: string | null;
  incidentType?: string | null;
}): string {
  const title =
    incident.importantDetails ||
    incident.specificIncidentType ||
    incident.incidentType ||
    "Incidente";
  return buildIncidentUrl(incident.id, title, incident.incidentTimestamp);
}
