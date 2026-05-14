import "server-only";

import { fetchLatestResults } from "./api";
import {
  getMiniDesawarData,
  mergeRecentWithMiniDesawar,
  mergeWeekPivotWithMiniDesawar,
  withoutScrapperMiniDesawarRows,
} from "./mini-desawar-data";
import { getLatestTimestamp, buildWeekPivotRows, type WeekPivotRow } from "./result-display";
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

export async function getResultsData({ bypassCache = false }: FetchOptions = {}): Promise<ResultsData> {
  try {
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
        lastUpdated: null,
        status: {
          type: "error",
          message: response.message || "Unable to load live results right now.",
        },
      };
    }

    const buckets = response.data.data;
    const today = withoutScrapperMiniDesawarRows(buckets.Today);
    const sourceRecent = withoutScrapperMiniDesawarRows(buckets.Recent);
    const week = buckets.WeekResult;
    const weekPivot = buildWeekPivotRows(week);
    const miniDesawar = await getMiniDesawarData(weekPivot.dates, { bypassCache });

    return {
      success: true,
      cached: response.cached,
      today,
      sourceRecent,
      recent: mergeRecentWithMiniDesawar(sourceRecent, miniDesawar.recent),
      week,
      weekPivot: mergeWeekPivotWithMiniDesawar(weekPivot, miniDesawar.week),
      featured: miniDesawar.featured,
      lastUpdated: getLatestTimestamp(today, sourceRecent, week),
      status: {
        type: "success",
        message: bypassCache
          ? "Fresh live results loaded from the API."
          : "Live results loaded from the API.",
      },
    };
  } catch (error) {
    return {
      success: false,
      cached: false,
      today: [],
      sourceRecent: [],
      recent: [],
      week: [],
      weekPivot: { dates: [], rows: [] },
      featured: null,
      lastUpdated: null,
      status: {
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load results",
      },
    };
  }
}
