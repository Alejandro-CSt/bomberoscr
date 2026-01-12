import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let relative = "hace un momento";

  if (diffDays > 0) {
    relative = `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
  } else if (diffHours > 0) {
    relative = `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  } else if (diffMinutes > 0) {
    relative = `hace ${diffMinutes} ${diffMinutes === 1 ? "minuto" : "minutos"}`;
  }

  return relative;
}
