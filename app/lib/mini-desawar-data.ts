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
  hasResult,
  isVisibleResult,
  normalizeCategory,
  type RawResultRecord,
  type ResultRow,
} from "./results";
import { isCanonicalSlotTime } from "./result-time";
import {
  CATEGORY_NAME,
  DEFAULT_RESULT_TIME,
  RESULTS_REVALIDATE_SECONDS,
  SITE_NAME,
} from "./site";

type FetchOptions = {
  bypassCache?: boolean;
};

const MINI_BACKEND_FETCH_TIMEOUT_MS = 8_000;

function getMiniBackendBaseUrl() {
  return process.env.MINIBACKEND_BASE_URL?.trim().replace(/\/$/, "") ?? "";
}

function getMiniBackendAuthCode() {
  return process.env.MINIBACKEND_AUTH_CODE?.trim().replace(/^"|"$/g, "") ?? "";
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

function pickCanonicalRowForDate(rows: ResultRow[], dateKey: string): ResultRow | null {
  const matches = rows.filter((row) => normalizeDateKey(row.date) === dateKey);

  if (!matches.length) {
    return null;
  }

  const eveningSlot = matches.find((row) => isCanonicalSlotTime(row.time));

  return eveningSlot ?? matches[matches.length - 1];
}

function uniqueDateKeys(rows: ResultRow[]) {
  return [...new Set(rows.map((row) => normalizeDateKey(row.date)).filter(Boolean))].sort((left, right) =>
    right.localeCompare(left)
  );
}

function rowsByDateDescending(rows: ResultRow[]) {
  return uniqueDateKeys(rows)
    .map((dateKey) => pickCanonicalRowForDate(rows, dateKey))
    .filter((row): row is ResultRow => row !== null);
}

function withEveningReleaseTime(row: ResultRow): ResultRow {
  return {
    ...row,
    time: DEFAULT_RESULT_TIME,
  };
}

function visibleNumber(row: ResultRow | null, now = new Date()) {
  if (!row || !hasResult(row)) {
    return null;
  }

  return isVisibleResult(withEveningReleaseTime(row), now) ? row.number : null;
}

function mergeChartDates(scrapperDates: string[], rows: ResultRow[]) {
  return [...new Set([...scrapperDates, ...uniqueDateKeys(rows)])].sort((left, right) =>
    right.localeCompare(left)
  );
}

async function fetchMiniDesawarRows({ bypassCache = false }: FetchOptions = {}) {
  const baseUrl = getMiniBackendBaseUrl();
  const authCode = getMiniBackendAuthCode();

  if (!baseUrl || !authCode) {
    return [];
  }

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = bypassCache
    ? { cache: "no-store" }
    : { next: { revalidate: RESULTS_REVALIDATE_SECONDS } };

  try {
    const response = await fetch(`${baseUrl}/api/fetch-result`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authCode}`,
        "X-App-Version": process.env.APP_VERSION || "2.0.3",
        "x-app-source": "mobile",
        "x-platform": "web",
      },
      signal: AbortSignal.timeout(MINI_BACKEND_FETCH_TIMEOUT_MS),
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
  } catch {
    return [];
  }
}

export function withoutScrapperMiniDesawarRows<T extends { ShiftName?: string }>(items: T[]) {
  return items.filter((item) => !isMiniDesawarName(item.ShiftName));
}

export function mapMiniDesawarFeaturedRow(rows: ResultRow[], now = new Date()): TodayResultItem | null {
  const todayKey = getIstTodayKey();
  const todayRow = pickCanonicalRowForDate(rows, todayKey);

  if (!todayRow) {
    return null;
  }

  return {
    ResultId: todayRow.id ?? "featured",
    ShiftName: SITE_NAME,
    ShiftResultTime: DEFAULT_RESULT_TIME,
    ResultDate: todayKey,
    Result: visibleNumber(todayRow, now),
  };
}

export function mapMiniDesawarRecentRow(rows: ResultRow[], now = new Date()): RecentResultItem | null {
  if (!rows.length) {
    return null;
  }

  const sorted = rowsByDateDescending(rows);
  const latest = sorted[0];
  const previous = sorted[1];

  return {
    ShiftName: SITE_NAME,
    ShiftResultTime: DEFAULT_RESULT_TIME,
    Date1: previous ? normalizeDateKey(previous.date) : undefined,
    Result1: visibleNumber(previous ?? null, now),
    Date2: latest ? normalizeDateKey(latest.date) : undefined,
    Result2: visibleNumber(latest ?? null, now),
  };
}

export function mapMiniDesawarWeekRow(
  rows: ResultRow[],
  dates: string[],
  now = new Date()
): WeekPivotRow | null {
  const chartDates = mergeChartDates(dates, rows);

  if (!chartDates.length) {
    return null;
  }

  return {
    name: SITE_NAME,
    time: DEFAULT_RESULT_TIME,
    values: Object.fromEntries(
      chartDates.map((date) => {
        const match = pickCanonicalRowForDate(rows, date);

        return [date, displayResult(visibleNumber(match, now))];
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
  const dates = miniWeekRow
    ? [...new Set([...weekPivot.dates, ...Object.keys(miniWeekRow.values)])].sort((left, right) =>
        right.localeCompare(left)
      )
    : weekPivot.dates;
  const row = miniWeekRow ?? buildFallbackWeekRow(dates);
  const filtered = weekPivot.rows.filter((item) => !isMiniDesawarName(item.name));

  return {
    dates,
    rows: [row, ...filtered],
  };
}

export async function getMiniDesawarData(dates: string[], options: FetchOptions = {}) {
  const rows = await fetchMiniDesawarRows(options);
  const now = new Date();
  const week = mapMiniDesawarWeekRow(rows, dates, now);

  return {
    featured: mapMiniDesawarFeaturedRow(rows, now),
    recent: mapMiniDesawarRecentRow(rows, now),
    week,
    weekDates: week ? Object.keys(week.values).sort((left, right) => right.localeCompare(left)) : [],
  };
}
