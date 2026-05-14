import "server-only";

import { fetchLatestResults } from "./api";
import {
  findFeaturedTodayResult,
  getLatestTimestamp,
  buildWeekPivotRows,
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
    const today = buckets.Today;
    const recent = buckets.Recent;
    const week = buckets.WeekResult;

    return {
      success: true,
      cached: response.cached,
      today,
      recent,
      week,
      weekPivot: buildWeekPivotRows(week),
      featured: findFeaturedTodayResult(today, recent),
      lastUpdated: getLatestTimestamp(today, recent, week),
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
