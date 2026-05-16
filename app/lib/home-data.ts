import "server-only";

import type { RecentResultItem } from "./api";
import { getIstTodayKey } from "./result-display";
import { normalizeResultSlotTime } from "./result-time";
import { RESULTS_REVALIDATE_SECONDS, RESULT_TIME_ZONE } from "./site";

export type HomeDataResultRow = {
  name: string;
  time: string;
  previous_result: string;
  current_result: string;
};

export type HomeDataPayload = {
  success: boolean;
  title: string;
  currentDate: string;
  previousDate: string;
  results: HomeDataResultRow[];
  recent: RecentResultItem[];
  updatedAt: string | null;
};

const HOME_DATA_FETCH_TIMEOUT_MS = 12_000;

const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

function getApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  }

  return value.replace(/\/$/, "");
}

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value).trim();
}

export function sanitizeHomeResult(value: unknown): string | number | null {
  const text = toText(value);

  if (!text || text.toUpperCase() === "XX") {
    return null;
  }

  return value as string | number;
}

export function parseDateFromHomeTitle(title: string) {
  const match = title.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/i);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = MONTHS[match[2].toLowerCase()] ?? MONTHS[match[2].toLowerCase().slice(0, 3)];
  const year = Number(match[3]);

  if (!month || !day || !year) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function previousIsoDate(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00+05:30`);
  date.setDate(date.getDate() - 1);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RESULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeHomeRows(value: unknown): HomeDataResultRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const row = entry as Record<string, unknown>;
      const name = toText(row.name);

      if (!name) {
        return null;
      }

      return {
        name,
        time: normalizeResultSlotTime(row.time),
        previous_result: toText(row.previous_result),
        current_result: toText(row.current_result),
      } satisfies HomeDataResultRow;
    })
    .filter((row): row is HomeDataResultRow => row !== null);
}

export function homeDataToRecentItems(
  results: HomeDataResultRow[],
  currentDate: string,
  previousDate: string
): RecentResultItem[] {
  return results.map((row, index) => ({
    ShiftId: String(index + 1),
    ShiftName: row.name,
    ShiftResultTime: row.time,
    Date1: previousDate,
    Result1: sanitizeHomeResult(row.previous_result),
    Date2: currentDate,
    Result2: sanitizeHomeResult(row.current_result),
  }));
}

type FetchOptions = {
  bypassCache?: boolean;
};

export async function fetchHomeData({ bypassCache = false }: FetchOptions = {}): Promise<HomeDataPayload> {
  const fetchOptions: RequestInit & { next?: { revalidate: number } } = bypassCache
    ? { cache: "no-store" }
    : { next: { revalidate: RESULTS_REVALIDATE_SECONDS } };

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/home-data`, {
      ...fetchOptions,
      signal: AbortSignal.timeout(HOME_DATA_FETCH_TIMEOUT_MS),
    });
    const text = await response.text();
    const json = text ? (JSON.parse(text) as Record<string, unknown>) : null;
    const payload =
      json?.data && typeof json.data === "object" ? (json.data as Record<string, unknown>) : null;

    if (!response.ok || !payload) {
      return emptyHomeData();
    }

    const title = toText(payload.title);
    const currentDate = parseDateFromHomeTitle(title) ?? getIstTodayKey();
    const previousDate = previousIsoDate(currentDate);
    const results = normalizeHomeRows(payload.results);
    const recent = homeDataToRecentItems(results, currentDate, previousDate);

    return {
      success: true,
      title,
      currentDate,
      previousDate,
      results,
      recent,
      updatedAt: toText(payload.updatedAt) || null,
    };
  } catch {
    return emptyHomeData();
  }
}

function emptyHomeData(): HomeDataPayload {
  const currentDate = getIstTodayKey();

  return {
    success: false,
    title: "",
    currentDate,
    previousDate: previousIsoDate(currentDate),
    results: [],
    recent: [],
    updatedAt: null,
  };
}
