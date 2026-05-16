import { DEFAULT_RESULT_TIME } from "./site";

/** Canonical draw slot — always `03:45 PM` (leading zero on hour). */
export function normalizeResultSlotTime(time: unknown): string {
  const raw = String(time ?? "").trim();

  if (!raw) {
    return DEFAULT_RESULT_TIME;
  }

  const match = raw.replace(".", ":").match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  const compact = raw.replace(/\s+/g, "").replace(".", ":").match(/^(\d{1,2})(?::(\d{2}))?(AM|PM)$/i);

  const parts = match ?? compact;

  if (!parts) {
    return DEFAULT_RESULT_TIME;
  }

  const hour = String(Number(parts[1])).padStart(2, "0");
  const minute = String(Number(parts[2] ?? 0)).padStart(2, "0");
  const period = parts[3].toUpperCase();

  return `${hour}:${minute} ${period}`;
}

export function slotTimeToMinutes(time: string) {
  const normalized = normalizeResultSlotTime(time);
  const match = normalized.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return 15 * 60 + 45;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hour < 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

export function isCanonicalSlotTime(time: unknown) {
  return normalizeResultSlotTime(time) === DEFAULT_RESULT_TIME;
}
