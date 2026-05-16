import { CATEGORY_NAME, DEFAULT_RESULT_TIME, RESULT_TIME_ZONE, SITE_NAME } from "./site";
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

export function isMiniDesawarName(name: string | undefined) {
  const normalized = normalizeShiftName(name);

  return (
    normalized === normalizeShiftName(CATEGORY_NAME) ||
    normalized === normalizeShiftName(SITE_NAME)
  );
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

export function getIstTodayKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RESULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function previousIsoDate(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00+05:30`);
  date.setDate(date.getDate() - 1);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RESULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function sanitizeApiCardResult(value: unknown): string | number | null {
  const text = toText(value);

  if (!text || text.toUpperCase() === "XX") {
    return null;
  }

  return value as string | number;
}

export function resolveTodayResultFromRecent(item: RecentResultItem, todayKey = getIstTodayKey()) {
  if (item.Date2 === todayKey) {
    return {
      resultDate: todayKey,
      result: sanitizeApiCardResult(item.Result2),
    };
  }

  if (item.Date1 === todayKey) {
    return {
      resultDate: todayKey,
      result: sanitizeApiCardResult(item.Result1),
    };
  }

  return {
    resultDate: todayKey,
    result: null,
  };
}

export function resolveCardDisplayFromRecent(item: RecentResultItem, todayKey = getIstTodayKey()) {
  const current = resolveTodayResultFromRecent(item, todayKey);

  let previousDate: string | undefined;
  let previousResult: string | number | null = null;

  if (current.resultDate === todayKey && item.Date2 === todayKey) {
    previousDate = item.Date1;
    previousResult = sanitizeApiCardResult(item.Result1);
  } else if (current.resultDate === todayKey && item.Date1 === todayKey) {
    previousDate = previousIsoDate(todayKey);
    previousResult = null;
  } else if (item.Date2 && item.Date2 < todayKey) {
    previousDate = item.Date2;
    previousResult = sanitizeApiCardResult(item.Result2);
  } else if (item.Date1 && item.Date1 < todayKey) {
    previousDate = item.Date1;
    previousResult = sanitizeApiCardResult(item.Result1);
  }

  return {
    resultDate: current.resultDate,
    result: current.result,
    previousDate,
    previousResult,
  };
}

function resolveFeaturedResultFromRecent(item: RecentResultItem, todayKey = getIstTodayKey()) {
  return resolveTodayResultFromRecent(item, todayKey);
}

function resolveTodayResultFromToday(item: TodayResultItem, todayKey = getIstTodayKey()) {
  return {
    resultDate: todayKey,
    result:
      item.ResultDate === todayKey || !item.ResultDate
        ? sanitizeApiCardResult(item.Result)
        : null,
  };
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

  return null;
}

export function getFeaturedResultValue(item: TodayResultItem | RecentResultItem | null) {
  if (!item) {
    return "";
  }

  if ("ResultDate" in item) {
    return displayResult(resolveTodayResultFromToday(item).result);
  }

  const recent = item as RecentResultItem;
  return displayResult(resolveFeaturedResultFromRecent(recent).result);
}

export function getFeaturedResultDate(item: TodayResultItem | RecentResultItem | null) {
  if (!item) {
    return "";
  }

  if ("ResultDate" in item) {
    return resolveTodayResultFromToday(item).resultDate;
  }

  const recent = item as RecentResultItem;
  return resolveFeaturedResultFromRecent(recent).resultDate;
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

/** Home / scrapper rows — main slot = IST today result; strip footer = previous day. */
export function buildScrapperApiCardItems(recent: RecentResultItem[]): TodayResultItem[] {
  return recent.map((item, index) => {
    const cardResult = resolveCardDisplayFromRecent(item);

    return {
      ResultId: item.ShiftId ? `recent-${item.ShiftId}` : `recent-${index}`,
      ShiftId: item.ShiftId,
      ShiftName: item.ShiftName,
      ShiftResultTime: item.ShiftResultTime,
      ShiftColor: item.ShiftColor,
      ResultDate: cardResult.resultDate,
      Result: cardResult.result,
      PreviousDate: cardResult.previousDate,
      PreviousResult: cardResult.previousResult,
      AddedDate: item.AddDate,
    };
  });
}

const PRIORITY_STRIP_ORDER = ["disawar", "gali", "faridabad", "shriganesh"];

const PRIORITY_GAME_ALIASES: Record<string, string> = {
  desawar: "disawar",
  shreeganesh: "shriganesh",
};

function resolvePriorityGameKey(name: string | undefined) {
  const key = normalizeShiftName(name);

  return PRIORITY_GAME_ALIASES[key] ?? key;
}

export function isPriorityStripGame(name: string | undefined) {
  return PRIORITY_STRIP_ORDER.includes(resolvePriorityGameKey(name));
}

function enrichEnvStripsWithRecent(envCards: TodayResultItem[], recent: RecentResultItem[]) {
  const todayKey = getIstTodayKey();
  const recentByName = new Map(
    recent.map((item) => [normalizeShiftName(item.ShiftName), item] as const)
  );

  return envCards.map((card) => {
    const match = recentByName.get(normalizeShiftName(card.ShiftName));

    if (!match) {
      return {
        ...card,
        ResultDate: todayKey,
      };
    }

    const display = resolveCardDisplayFromRecent(match, todayKey);
    const envFallback = sanitizeApiCardResult(card.Result);

    return {
      ...card,
      ResultDate: display.resultDate,
      Result: display.result ?? envFallback,
      PreviousDate: display.previousDate,
      PreviousResult: display.previousResult,
    };
  });
}

function sortResultStrips(strips: TodayResultItem[]) {
  const unique = new Map<string, TodayResultItem>();

  strips.forEach((strip) => {
    const key = normalizeShiftName(strip.ShiftName);

    if (key) {
      unique.set(key, strip);
    }
  });

  const priority = PRIORITY_STRIP_ORDER.map((orderKey) =>
    [...unique.entries()].find(([key]) => resolvePriorityGameKey(key) === orderKey)
  )
    .filter((entry): entry is [string, TodayResultItem] => entry !== undefined)
    .map(([, strip]) => strip);
  const rest = [...unique.values()].filter((strip) => !isPriorityStripGame(strip.ShiftName));

  return [...priority, ...rest];
}

export type HomeDisplayItems = {
  featured: TodayResultItem;
  priorityStrips: TodayResultItem[];
  strips: TodayResultItem[];
};

export function buildHomeDisplayItems(
  _today: TodayResultItem[],
  recent: RecentResultItem[],
  featured: TodayResultItem | RecentResultItem | null,
  siteName: string,
  envCards: TodayResultItem[] = []
): HomeDisplayItems {
  const featuredCard = featuredToCardItem(featured, siteName);
  const envNames = new Set(
    envCards.map((item) => normalizeShiftName(item.ShiftName)).filter(Boolean)
  );
  const apiStrips = buildScrapperApiCardItems(recent).filter(
    (item) =>
      !isMiniDesawarName(item.ShiftName) && !envNames.has(normalizeShiftName(item.ShiftName))
  );
  const envStrips = enrichEnvStripsWithRecent(envCards, recent);

  const sortedStrips = sortResultStrips([...envStrips, ...apiStrips]);

  return {
    featured: featuredCard,
    priorityStrips: sortedStrips.filter((strip) => isPriorityStripGame(strip.ShiftName)),
    strips: sortedStrips.filter((strip) => !isPriorityStripGame(strip.ShiftName)),
  };
}

export function featuredToCardItem(
  featured: TodayResultItem | RecentResultItem | null,
  siteName: string
): TodayResultItem {
  if (featured && "ResultDate" in featured) {
    const todayResult = resolveTodayResultFromToday(featured);

    return {
      ResultId: featured.ResultId ?? "featured",
      ShiftId: featured.ShiftId,
      ShiftName: siteName,
      ShiftResultTime: featured.ShiftResultTime,
      ShiftColor: featured.ShiftColor,
      ResultDate: todayResult.resultDate,
      Result: todayResult.result,
    };
  }

  if (featured) {
    const recent = featured as RecentResultItem;
    const todayResult = resolveFeaturedResultFromRecent(recent);

    return {
      ResultId: `featured-${recent.ShiftId ?? "0"}`,
      ShiftId: recent.ShiftId,
      ShiftName: siteName,
      ShiftResultTime: recent.ShiftResultTime,
      ShiftColor: recent.ShiftColor,
      ResultDate: todayResult.resultDate,
      Result: todayResult.result,
    };
  }

  return {
    ResultId: "featured",
    ShiftName: siteName,
    ShiftResultTime: DEFAULT_RESULT_TIME,
    ResultDate: getIstTodayKey(),
    Result: null,
  };
}

