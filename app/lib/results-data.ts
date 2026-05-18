import "server-only";

import { fetchLatestResults } from "./api";
import { fetchHomeData } from "./home-data";
import {
  getMiniDesawarData,
  mergeRecentWithMiniDesawar,
  mergeWeekPivotWithMiniDesawar,
  withoutScrapperMiniDesawarRows,
} from "./mini-desawar-data";
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
  lastUpdated: string | null;
  status: ResultsStatus;
};

function buildResultsFromLatest(
  response: Extract<Awaited<ReturnType<typeof fetchLatestResults>>, { success: true }>,
  homeData: Awaited<ReturnType<typeof fetchHomeData>>,
  miniDesawar: Awaited<ReturnType<typeof getMiniDesawarData>>,
  bypassCache: boolean
): ResultsData {
  const buckets = response.data.data;
  const today = withoutScrapperMiniDesawarRows(buckets.Today);
  const latestRecent = withoutScrapperMiniDesawarRows(buckets.Recent);
  const sourceRecent =
    homeData.success && homeData.recent.length > 0
      ? withoutScrapperMiniDesawarRows(homeData.recent)
      : latestRecent;
  const week = buckets.WeekResult;
  const weekPivot = buildWeekPivotRows(week);

  return {
    success: true,
    cached: response.cached,
    today,
    sourceRecent,
    recent: mergeRecentWithMiniDesawar(latestRecent, miniDesawar.recent),
    week,
    weekPivot: mergeWeekPivotWithMiniDesawar(weekPivot, miniDesawar.week),
    featured: miniDesawar.featured ?? findFeaturedTodayResult(buckets.Today, buckets.Recent),
    lastUpdated: getLatestTimestamp(today, sourceRecent, week),
    status: {
      type: "success",
      message: bypassCache
        ? "Fresh live results loaded from the API."
        : "Live results loaded from the API.",
    },
  };
}

function buildResultsFromHomeDataOnly(
  homeData: Awaited<ReturnType<typeof fetchHomeData>>,
  miniDesawar: Awaited<ReturnType<typeof getMiniDesawarData>>,
  bypassCache: boolean
): ResultsData {
  const sourceRecent = withoutScrapperMiniDesawarRows(homeData.recent);

  return {
    success: true,
    cached: false,
    today: [],
    sourceRecent,
    recent: mergeRecentWithMiniDesawar(sourceRecent, miniDesawar.recent),
    week: [],
    weekPivot: mergeWeekPivotWithMiniDesawar({ dates: [], rows: [] }, miniDesawar.week),
    featured: miniDesawar.featured,
    lastUpdated: homeData.updatedAt,
    status: {
      type: "success",
      message: bypassCache
        ? "Fresh live results loaded from home data."
        : "Live results loaded from home data.",
    },
  };
}

export async function getResultsData({ bypassCache = false }: FetchOptions = {}): Promise<ResultsData> {
  const [homeData, response] = await Promise.all([
    fetchHomeData({ bypassCache }),
    fetchLatestResults({ bypassCache }),
  ]);

  const weekPivot = response.success
    ? buildWeekPivotRows(response.data.data.WeekResult)
    : { dates: [], rows: [] };

  let miniDesawar: Awaited<ReturnType<typeof getMiniDesawarData>> = {
    featured: null,
    recent: null,
    week: null,
    weekDates: [],
  };

  try {
    miniDesawar = await getMiniDesawarData(weekPivot.dates, { bypassCache });
  } catch {
    // Mini backend must not block scrapper results from rendering.
  }

  if (response.success) {
    return buildResultsFromLatest(response, homeData, miniDesawar, bypassCache);
  }

  if (homeData.success) {
    return buildResultsFromHomeDataOnly(homeData, miniDesawar, bypassCache);
  }

  return {
    success: false,
    cached: response.success === false ? response.cached : false,
    today: [],
    sourceRecent: [],
    recent: [],
    week: [],
    weekPivot: { dates: [], rows: [] },
    featured: null,
    lastUpdated: null,
    status: {
      type: "error",
      message:
        (response.success === false ? response.message : null) ||
        "Unable to load live results right now.",
    },
  };
}
