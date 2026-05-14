import "server-only";

import type { RecentResultItem, TodayResultItem } from "./api";
import {
  displayResult,
  getIstTodayKey,
  getRecentDateLabels,
  isMiniDesawarName,
  type WeekPivotRow,
} from "./result-display";
import {
  flattenResults,
  getRecordCategoryName,
  normalizeCategory,
  type RawResultRecord,
  type ResultRow,
} from "./results";
import {
  CATEGORY_NAME,
  DEFAULT_RESULT_TIME,
  RESULTS_REVALIDATE_SECONDS,
  SITE_NAME,
} from "./site";

type FetchOptions = {
  bypassCache?: boolean;
};

function getMiniBackendBaseUrl() {
  return process.env.MINIBACKEND_BASE_URL?.trim().replace(/\/$/, "") ?? "";
}

function getPayloadArray(json: unknown) {
  if (Array.isArray(json)) {
    return json;
  }

  if (!json || typeof json !== "object") {
    return [];
  }

  const payload = json as Record<string, unknown>;
  const key = ["data", "result", "results", "payload"].find((name) => Array.isArray(payload[name]));

  return key ? (payload[key] as unknown[]) : [];
}

function normalizeDateKey(date: string) {
  const value = date.trim();
  const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);

  return iso ? iso[1] : value;
}

function filterConfiguredCategory(records: RawResultRecord[]) {
  const configuredCategory = normalizeCategory(CATEGORY_NAME);

  return records.filter(
    (record) => normalizeCategory(getRecordCategoryName(record)) === configuredCategory
  );
}

async function fetchMiniDesawarRows({ bypassCache = false }: FetchOptions = {}) {
  const baseUrl = getMiniBackendBaseUrl();

  if (!baseUrl) {
    return [];
  }

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = bypassCache
    ? { cache: "no-store" }
    : { next: { revalidate: RESULTS_REVALIDATE_SECONDS } };

  const response = await fetch(`${baseUrl}/api/fetch-result-direct`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-App-Version": process.env.APP_VERSION || "2.0.3",
      "x-app-source": "mobile",
      "x-platform": "web",
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    return [];
  }

  const text = await response.text();
  const json = text ? (JSON.parse(text) as unknown) : {};

  return flattenResults(
    filterConfiguredCategory(
      getPayloadArray(json).filter(
        (record): record is RawResultRecord => !!record && typeof record === "object"
      )
    )
  );
}

function sortRowsByDate(rows: ResultRow[]) {
  return [...rows].sort((left, right) =>
    normalizeDateKey(right.date).localeCompare(normalizeDateKey(left.date))
  );
}

export function withoutScrapperMiniDesawarRows<T extends { ShiftName?: string }>(items: T[]) {
  return items.filter((item) => !isMiniDesawarName(item.ShiftName));
}

export function mapMiniDesawarFeaturedRow(rows: ResultRow[]): TodayResultItem | null {
  const todayKey = getIstTodayKey();
  const todayRow = rows.find((row) => normalizeDateKey(row.date) === todayKey);

  if (!todayRow) {
    return null;
  }

  return {
    ResultId: todayRow.id ?? "featured",
    ShiftName: SITE_NAME,
    ShiftResultTime: todayRow.time || DEFAULT_RESULT_TIME,
    ResultDate: todayKey,
    Result: todayRow.number ?? null,
  };
}

export function mapMiniDesawarRecentRow(rows: ResultRow[]): RecentResultItem | null {
  if (!rows.length) {
    return null;
  }

  const sorted = sortRowsByDate(rows);
  const latest = sorted[0];
  const previous = sorted[1];

  return {
    ShiftName: SITE_NAME,
    ShiftResultTime: latest.time || DEFAULT_RESULT_TIME,
    Date1: previous ? normalizeDateKey(previous.date) : undefined,
    Result1: previous?.number ?? null,
    Date2: latest ? normalizeDateKey(latest.date) : undefined,
    Result2: latest?.number ?? null,
  };
}

export function mapMiniDesawarWeekRow(rows: ResultRow[], dates: string[]): WeekPivotRow | null {
  if (!dates.length) {
    return null;
  }

  const latest = sortRowsByDate(rows)[0];

  return {
    name: SITE_NAME,
    time: latest?.time || DEFAULT_RESULT_TIME,
    values: Object.fromEntries(
      dates.map((date) => {
        const match = rows.find((row) => normalizeDateKey(row.date) === date);

        return [date, displayResult(match?.number)];
      })
    ),
  };
}

function buildFallbackRecentRow(recent: RecentResultItem[]): RecentResultItem {
  const { date1, date2 } = getRecentDateLabels(recent);

  return {
    ShiftName: SITE_NAME,
    ShiftResultTime: DEFAULT_RESULT_TIME,
    Date1: date1,
    Result1: null,
    Date2: date2,
    Result2: null,
  };
}

function buildFallbackWeekRow(dates: string[]): WeekPivotRow {
  return {
    name: SITE_NAME,
    time: DEFAULT_RESULT_TIME,
    values: Object.fromEntries(dates.map((date) => [date, "XX"])),
  };
}

export function mergeRecentWithMiniDesawar(
  recent: RecentResultItem[],
  miniRecent: RecentResultItem | null
) {
  const row = miniRecent ?? buildFallbackRecentRow(recent);
  const filtered = recent.filter((item) => !isMiniDesawarName(item.ShiftName));

  return [row, ...filtered];
}

export function mergeWeekPivotWithMiniDesawar(
  weekPivot: { dates: string[]; rows: WeekPivotRow[] },
  miniWeekRow: WeekPivotRow | null
) {
  const row = miniWeekRow ?? buildFallbackWeekRow(weekPivot.dates);
  const filtered = weekPivot.rows.filter((item) => !isMiniDesawarName(item.name));

  return {
    dates: weekPivot.dates,
    rows: [row, ...filtered],
  };
}

export async function getMiniDesawarData(dates: string[], options: FetchOptions = {}) {
  const rows = await fetchMiniDesawarRows(options);

  return {
    featured: mapMiniDesawarFeaturedRow(rows),
    recent: mapMiniDesawarRecentRow(rows),
    week: mapMiniDesawarWeekRow(rows, dates),
  };
}
