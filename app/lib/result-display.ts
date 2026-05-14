import { CATEGORY_NAME, DEFAULT_RESULT_TIME, OTHER_GAME_PLACEHOLDERS, RESULT_TIME_ZONE } from "./site";
import type { RecentResultItem, TodayResultItem, WeekResultItem } from "./api";

export type WeekPivotRow = {
  name: string;
  time: string;
  color?: string;
  values: Record<string, string>;
};

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value).trim();
}

export function normalizeShiftName(value: unknown) {
  return toText(value).toLowerCase().replace(/[\s_-]+/g, "");
}

export function displayResult(value: unknown) {
  const text = toText(value);

  return text || "XX";
}

export function formatShortDate(value: string | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: RESULT_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatLongDate(value: string | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: RESULT_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatResultTime(value: string | undefined) {
  const text = toText(value);

  if (!text) {
    return "—";
  }

  if (/[ap]m/i.test(text)) {
    return text;
  }

  const date = new Date(`1970-01-01T${text}`);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: RESULT_TIME_ZONE,
  });
}

export function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Waiting for first update";
  }

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: RESULT_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function parseTimestamp(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function getLatestTimestamp(
  today: TodayResultItem[],
  recent: RecentResultItem[],
  week: WeekResultItem[]
) {
  const timestamps = [
    ...today.map((item) => parseTimestamp(item.UpdatedDate ?? item.AddedDate)),
    ...recent.map((item) => parseTimestamp(item.AddDate)),
    ...week.map((item) => parseTimestamp(item.ResultDate)),
  ].filter(Boolean);

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

export function findFeaturedTodayResult(
  today: TodayResultItem[],
  recent: RecentResultItem[]
): TodayResultItem | RecentResultItem | null {
  const configuredName = normalizeShiftName(CATEGORY_NAME);

  const todayMatch = today.find((item) => normalizeShiftName(item.ShiftName) === configuredName);
  if (todayMatch) {
    return todayMatch;
  }

  const recentMatch = recent.find((item) => normalizeShiftName(item.ShiftName) === configuredName);
  if (recentMatch) {
    return recentMatch;
  }

  return today[0] ?? recent[0] ?? null;
}

export function getFeaturedResultValue(item: TodayResultItem | RecentResultItem | null) {
  if (!item) {
    return "";
  }

  if ("ResultDate" in item) {
    return displayResult(item.Result);
  }

  const recent = item as RecentResultItem;
  return displayResult(recent.Result2 ?? recent.Result1);
}

export function getFeaturedResultDate(item: TodayResultItem | RecentResultItem | null) {
  if (!item) {
    return "";
  }

  if ("ResultDate" in item) {
    return item.ResultDate ?? "";
  }

  const recent = item as RecentResultItem;
  return recent.Date2 ?? recent.Date1 ?? "";
}

export function getFeaturedResultTime(item: TodayResultItem | RecentResultItem | null) {
  return item?.ShiftResultTime ?? "";
}

export function buildWeekPivotRows(week: WeekResultItem[]) {
  const dates = [...week]
    .map((row) => toText(row.ResultDate))
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left));

  const rowMap = new Map<string, WeekPivotRow>();

  week.forEach((entry) => {
    const date = toText(entry.ResultDate);

    if (!date) {
      return;
    }

    for (let index = 1; index <= 4; index += 1) {
      const name = toText(entry[`Shift${index}` as keyof WeekResultItem]);
      const time = toText(entry[`ShiftResultTime${index}` as keyof WeekResultItem]);
      const color = toText(entry[`ShiftColor${index}` as keyof WeekResultItem]);
      const result = displayResult(entry[`Result${index}` as keyof WeekResultItem]);

      if (!name) {
        continue;
      }

      const existing = rowMap.get(name) ?? {
        name,
        time,
        color: color || undefined,
        values: {},
      };

      existing.values[date] = result;
      existing.time = existing.time || time;
      existing.color = existing.color || color || undefined;
      rowMap.set(name, existing);
    }
  });

  return {
    dates,
    rows: [...rowMap.values()].sort((left, right) => left.name.localeCompare(right.name)),
  };
}

export function getRecentDateLabels(recent: RecentResultItem[]) {
  const first = recent[0];

  return {
    date1: first?.Date1,
    date2: first?.Date2,
  };
}

export function hasResultValue(value: unknown) {
  const text = toText(value);

  return Boolean(text) && text !== "XX";
}

export function buildTodayCardItems(
  today: TodayResultItem[],
  recent: RecentResultItem[]
): TodayResultItem[] {
  if (today.length) {
    return today;
  }

  if (recent.length) {
    return recent.map((item, index) => ({
      ResultId: item.ShiftId ? `recent-${item.ShiftId}` : `recent-${index}`,
      ShiftId: item.ShiftId,
      ShiftName: item.ShiftName,
      ShiftResultTime: item.ShiftResultTime,
      ShiftColor: item.ShiftColor,
      ResultDate: item.Date2 ?? item.Date1,
      Result: item.Result2 ?? item.Result1,
      AddedDate: item.AddDate,
    }));
  }

  return OTHER_GAME_PLACEHOLDERS.map((game, index) => ({
    ResultId: `placeholder-${index}`,
    ShiftId: String(index + 1),
    ShiftName: game.name,
    ShiftResultTime: game.time,
    Result: null,
  } satisfies TodayResultItem));
}

export function featuredToCardItem(
  featured: TodayResultItem | RecentResultItem | null,
  siteName: string
): TodayResultItem {
  if (featured && "ResultDate" in featured) {
    return {
      ResultId: featured.ResultId ?? "featured",
      ShiftId: featured.ShiftId,
      ShiftName: siteName,
      ShiftResultTime: featured.ShiftResultTime,
      ShiftColor: featured.ShiftColor,
      ResultDate: featured.ResultDate,
      Result: featured.Result,
    };
  }

  if (featured) {
    const recent = featured as RecentResultItem;

    return {
      ResultId: `featured-${recent.ShiftId ?? "0"}`,
      ShiftId: recent.ShiftId,
      ShiftName: siteName,
      ShiftResultTime: recent.ShiftResultTime,
      ShiftColor: recent.ShiftColor,
      ResultDate: recent.Date2 ?? recent.Date1,
      Result: recent.Result2 ?? recent.Result1,
    };
  }

  return {
    ResultId: "featured",
    ShiftName: siteName,
    ShiftResultTime: DEFAULT_RESULT_TIME,
    Result: null,
  };
}

export function buildHomeCardItems(
  today: TodayResultItem[],
  recent: RecentResultItem[],
  featured: TodayResultItem | RecentResultItem | null,
  siteName: string
): TodayResultItem[] {
  const configuredName = normalizeShiftName(CATEGORY_NAME);
  const featuredCard = featuredToCardItem(featured, siteName);
  const otherCards = buildTodayCardItems(today, recent).filter(
    (item) => normalizeShiftName(item.ShiftName) !== configuredName
  );

  return [featuredCard, ...otherCards];
}
