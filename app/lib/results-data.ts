import "server-only";

import { fetchLatestResults } from "./api";
import {
  getMiniDesawarData,
  mergeRecentWithMiniDesawar,
  mergeWeekPivotWithMiniDesawar,
  withoutScrapperMiniDesawarRows,
} from "./mini-desawar-data";
import { buildEnvGameCardItems } from "./env-game-cards";
import {
  buildWeekPivotRows,
  findFeaturedTodayResult,
  getLatestTimestamp,
  type WeekPivotRow,
} from "./result-display";
import type { RecentResultItem, TodayResultItem, WeekResultItem } from "./api";

type FetchOptions = {
  bypassCache?: boolean;
};

export type ResultsStatus = {
  type: "success" | "error";
  message: string;
};

export type ResultsData = {
  success: boolean;
  cached: boolean;
  today: TodayResultItem[];
  sourceRecent: RecentResultItem[];
  recent: RecentResultItem[];
  week: WeekResultItem[];
  weekPivot: {
    dates: string[];
    rows: WeekPivotRow[];
  };
  featured: TodayResultItem | RecentResultItem | null;
  envCards: TodayResultItem[];
  lastUpdated: string | null;
  status: ResultsStatus;
};

function buildResultsFromLatest(
  response: Extract<Awaited<ReturnType<typeof fetchLatestResults>>, { success: true }>,
  miniDesawar: Awaited<ReturnType<typeof getMiniDesawarData>>,
  bypassCache: boolean
): ResultsData {
  const buckets = response.data.data;
  const today = withoutScrapperMiniDesawarRows(buckets.Today);
  const sourceRecent = withoutScrapperMiniDesawarRows(buckets.Recent);
  const week = buckets.WeekResult;
  const weekPivot = buildWeekPivotRows(week);

  return {
    success: true,
    cached: response.cached,
    today,
    sourceRecent,
    recent: mergeRecentWithMiniDesawar(sourceRecent, miniDesawar.recent),
    week,
    weekPivot: mergeWeekPivotWithMiniDesawar(weekPivot, miniDesawar.week),
    featured: miniDesawar.featured ?? findFeaturedTodayResult(buckets.Today, buckets.Recent),
    envCards: buildEnvGameCardItems(),
    lastUpdated: getLatestTimestamp(today, sourceRecent, week),
    status: {
      type: "success",
      message: bypassCache
        ? "Fresh live results loaded from the API."
        : "Live results loaded from the API.",
    },
  };
}

export async function getResultsData({ bypassCache = false }: FetchOptions = {}): Promise<ResultsData> {
  const response = await fetchLatestResults({ bypassCache });

  if (!response.success) {
    return {
      success: false,
      cached: response.cached,
      today: [],
      sourceRecent: [],
      recent: [],
      week: [],
      weekPivot: { dates: [], rows: [] },
      featured: null,
      envCards: buildEnvGameCardItems(),
      lastUpdated: null,
      status: {
        type: "error",
        message: response.message || "Unable to load live results right now.",
      },
    };
  }

  const weekPivot = buildWeekPivotRows(response.data.data.WeekResult);
  let miniDesawar: Awaited<ReturnType<typeof getMiniDesawarData>> = {
    featured: null,
    recent: null,
    week: null,
  };

  try {
    miniDesawar = await getMiniDesawarData(weekPivot.dates, { bypassCache });
  } catch {
    // Mini backend must not block scrapper /api/latest results from rendering.
  }

  return buildResultsFromLatest(response, miniDesawar, bypassCache);
}
