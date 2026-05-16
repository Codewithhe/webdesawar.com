import { RESULTS_REVALIDATE_SECONDS } from "./site";

export type TodayResultItem = {
  ResultId?: string;
  ShiftId?: string;
  ResultDate?: string;
  Result?: string | number | null;
  RecordStatus?: string;
  AddedBy?: string;
  AddedDate?: string;
  UpdatedBy?: string;
  UpdatedDate?: string;
  ShiftName?: string;
  ShiftResultTime?: string;
  ShiftColor?: string;
};

export type RecentResultItem = {
  ShiftId?: string;
  ShiftName?: string;
  ShiftResultTime?: string;
  ShiftColor?: string;
  OrganizationName?: string;
  ResultCount?: string;
  Date1?: string;
  Result1?: string | number | null;
  Date2?: string;
  Result2?: string | number | null;
  AddDate?: string;
};

export type WeekResultItem = {
  ResultDate?: string;
  ShiftId1?: string;
  Shift1?: string;
  ShiftResultTime1?: string;
  ShiftColor1?: string;
  Result1?: string | number | null;
  ShiftId2?: string;
  Shift2?: string;
  ShiftResultTime2?: string;
  ShiftColor2?: string;
  Result2?: string | number | null;
  ShiftId3?: string;
  Shift3?: string;
  ShiftResultTime3?: string;
  ShiftColor3?: string;
  Result3?: string | number | null;
  ShiftId4?: string;
  Shift4?: string;
  ShiftResultTime4?: string;
  ShiftColor4?: string;
  Result4?: string | number | null;
  ResultCount?: string;
};

export type LatestResultBuckets = {
  Today: TodayResultItem[];
  Recent: RecentResultItem[];
  WeekResult: WeekResultItem[];
};

export type LatestApiSuccess = {
  success: true;
  cached: boolean;
  data: {
    status: boolean;
    message: string;
    data: LatestResultBuckets;
  };
};

export type LatestApiFailure = {
  success: false;
  cached: boolean;
  message: string;
};

export type LatestApiResponse = LatestApiSuccess | LatestApiFailure;

type FetchLatestOptions = {
  bypassCache?: boolean;
};

function getApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  }

  return value.replace(/\/$/, "");
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeBuckets(payload: unknown): LatestResultBuckets {
  const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const inner =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  return {
    Today: asArray<TodayResultItem>(inner.Today),
    Recent: asArray<RecentResultItem>(inner.Recent),
    WeekResult: asArray<WeekResultItem>(inner.WeekResult),
  };
}

const LATEST_RESULTS_FETCH_TIMEOUT_MS = 12_000;

export async function fetchLatestResults({
  bypassCache = false,
}: FetchLatestOptions = {}): Promise<LatestApiResponse> {
  const fetchOptions: RequestInit & { next?: { revalidate: number } } = bypassCache
    ? { cache: "no-store" }
    : { next: { revalidate: RESULTS_REVALIDATE_SECONDS } };

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/latest`, {
      ...fetchOptions,
      signal: AbortSignal.timeout(LATEST_RESULTS_FETCH_TIMEOUT_MS),
    });
    const text = await response.text();
    const json = text ? (JSON.parse(text) as LatestApiResponse) : null;

    if (!response.ok || !json) {
      return {
        success: false,
        cached: false,
        message: "Unable to load live results right now.",
      };
    }

    if (!json.success) {
      return json;
    }

    return {
      success: true,
      cached: Boolean(json.cached),
      data: {
        status: Boolean(json.data?.status),
        message: String(json.data?.message ?? "Result list!"),
        data: normalizeBuckets(json.data?.data),
      },
    };
  } catch {
    return {
      success: false,
      cached: false,
      message: "Unable to load live results right now.",
    };
  }
}
