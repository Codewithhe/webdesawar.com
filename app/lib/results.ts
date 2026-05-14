import { DEFAULT_RESULT_TIME, RESULT_TIME_ZONE } from "./site";

export type RawResultRecord = Record<string, unknown>;

export type ResultRow = {
  id?: string;
  categoryname: string;
  date: string;
  time: string;
  number: string | number;
};

function asRecord(value: unknown): RawResultRecord | null {
  return value && typeof value === "object" ? (value as RawResultRecord) : null;
}

function pick(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

export function normalizeCategory(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

export function normalizeTime(time: unknown) {
  if (!time) {
    return "";
  }

  const date = new Date(`1970-01-01 ${String(time)}`);

  if (Number.isNaN(date.getTime())) {
    return String(time).trim();
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getRecordCategoryName(record: RawResultRecord | null | undefined) {
  return toText(record?.categoryname ?? record?.title ?? record?.name ?? record?.category);
}

export function hasResult(row: ResultRow) {
  return row.number !== undefined && row.number !== null && String(row.number).trim() !== "";
}

type DateParts = {
  year: number;
  month: number;
  day: number;
};

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function normalizeYear(year: string) {
  const parsed = Number(year);

  return parsed < 100 ? 2000 + parsed : parsed;
}

function isValidDateParts(parts: DateParts) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  return (
    date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() === parts.month - 1 &&
    date.getUTCDate() === parts.day
  );
}

function makeDateParts(year: string | number, month: string | number, day: string | number) {
  const parts = {
    year: typeof year === "string" ? normalizeYear(year) : year,
    month: Number(month),
    day: Number(day),
  };

  return isValidDateParts(parts) ? parts : null;
}

function parseDateParts(date: string) {
  const value = date.trim();

  if (!value) {
    return null;
  }

  const isoDate = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s].*)?$/);

  if (isoDate) {
    return makeDateParts(isoDate[1], isoDate[2], isoDate[3]);
  }

  const numericDate = value.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})(?:\s.*)?$/);

  if (numericDate) {
    return makeDateParts(numericDate[3], numericDate[2], numericDate[1]);
  }

  const namedDate = value.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s,-]+([a-z]+)[\s,-]+(\d{2,4})$/i);

  if (namedDate) {
    const month = MONTHS[namedDate[2].toLowerCase()];

    return month ? makeDateParts(namedDate[3], month, namedDate[1]) : null;
  }

  const namedDateReverse = value.match(/^([a-z]+)[\s,-]+(\d{1,2})(?:st|nd|rd|th)?[\s,-]+(\d{2,4})$/i);

  if (namedDateReverse) {
    const month = MONTHS[namedDateReverse[1].toLowerCase()];

    return month ? makeDateParts(namedDateReverse[3], month, namedDateReverse[2]) : null;
  }

  return null;
}

function dateKey(parts: DateParts) {
  return parts.year * 10000 + parts.month * 100 + parts.day;
}

function rowDateKey(row: ResultRow) {
  const resultDate = parseDateParts(row.date);

  return resultDate ? dateKey(resultDate) : 0;
}

function getCurrentIstDateTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: RESULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function parseTimeToMinutes(time: string) {
  const value = time.trim().replace(".", ":");
  const match = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);

  if (!match) {
    return 19 * 60 + 30;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hour < 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

export function isResultVisible(row: ResultRow, now = new Date()) {
  const currentIst = getCurrentIstDateTime(now);
  const releaseMinutes = parseTimeToMinutes(row.time || DEFAULT_RESULT_TIME);
  const resultDate = parseDateParts(row.date);

  if (!resultDate) {
    return currentIst.minutes >= releaseMinutes;
  }

  const resultDateKey = dateKey(resultDate);
  const currentDateKey = dateKey(currentIst);

  if (resultDateKey < currentDateKey) {
    return true;
  }

  if (resultDateKey > currentDateKey) {
    return false;
  }

  return currentIst.minutes >= releaseMinutes;
}

export function isVisibleResult(row: ResultRow, now = new Date()) {
  return hasResult(row) && isResultVisible(row, now);
}

function formatDateParts(resultDate: DateParts) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: RESULT_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(resultDate.year, resultDate.month - 1, resultDate.day)));
}

export function formatResultDate(date: string) {
  const resultDate = parseDateParts(date);

  return resultDate ? formatDateParts(resultDate) : date;
}

export function formatTodayResultDate(now = new Date()) {
  const currentIst = getCurrentIstDateTime(now);

  return formatDateParts(currentIst);
}

export function isTodayResult(row: ResultRow, now = new Date()) {
  const resultDate = parseDateParts(row.date);

  if (!resultDate) {
    return false;
  }

  return dateKey(resultDate) === dateKey(getCurrentIstDateTime(now));
}

export function getTodayResultRow(rows: ResultRow[], now = new Date()) {
  return rows.find((row) => isTodayResult(row, now)) ?? null;
}

function pushRow(rows: ResultRow[], source: RawResultRecord, overrides: RawResultRecord = {}) {
  const row = {
    id: toText(source._id) || undefined,
    categoryname: toText(
      pick(
        overrides.categoryname,
        source.categoryname,
        source.title,
        source.name,
        source.category
      )
    ),
    date: toText(pick(overrides.date, source.date)),
    time: normalizeTime(pick(overrides.time, source.time)) || DEFAULT_RESULT_TIME,
    number: pick(overrides.number, source.number) as string | number,
  };

  if (row.categoryname || row.date || row.time || row.number) {
    rows.push(row);
  }
}

export function flattenResults(records: RawResultRecord[] = []) {
  const rows: ResultRow[] = [];

  records.forEach((record) => {
    const source = asRecord(record);

    if (!source) {
      return;
    }

    if (!Array.isArray(source.result) || source.result.length === 0) {
      pushRow(rows, source);
      return;
    }

    source.result.forEach((entryValue) => {
      const entry = asRecord(entryValue);

      if (!entry) {
        return;
      }

      if (Array.isArray(entry.times) && entry.times.length > 0) {
        entry.times.forEach((timeEntryValue) => {
          const timeEntry = asRecord(timeEntryValue);

          if (!timeEntry) {
            return;
          }

          pushRow(rows, source, {
            date: pick(timeEntry.date, entry.date),
            time: timeEntry.time,
            number: timeEntry.number,
          });
        });
        return;
      }

      pushRow(rows, source, {
        date: entry.date,
        time: entry.time,
        number: entry.number,
      });
    });
  });

  return rows;
}

export function getLatestResult(rows: ResultRow[]) {
  return [...rows]
    .filter(hasResult)
    .sort((a, b) => rowDateKey(b) - rowDateKey(a))[0] ?? rows[0] ?? null;
}

export function getCategoryName(records: RawResultRecord[], rows: ResultRow[]) {
  return (
    rows.find((row) => row.categoryname)?.categoryname ??
    getRecordCategoryName(records.find((record) => getRecordCategoryName(record))) ??
    ""
  );
}
