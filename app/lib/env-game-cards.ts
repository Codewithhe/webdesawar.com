import "server-only";

import type { TodayResultItem } from "./api";
import { getIstTodayKey } from "./result-display";
import { normalizeResultSlotTime } from "./result-time";

export type EnvGameCard = {
  name: string;
  time: string;
  result: string | number | null;
};

const DEFAULT_ENV_GAMES: EnvGameCard[] = [
  { name: "Faridabad", time: "06:00 PM", result: "80" },
  { name: "Ghaziabad", time: "08:10 PM", result: "XX" },
  { name: "Gali", time: "11:50 PM", result: "XX" },
];

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function parseEnvResult(value: string | undefined) {
  const text = toText(value);

  if (!text || text.toUpperCase() === "XX" || text === "-") {
    return "XX";
  }

  return text;
}

function parseEnvGame(entry: unknown): EnvGameCard | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const name = toText(record.name);

  if (!name) {
    return null;
  }

  return {
    name,
    time: normalizeResultSlotTime(record.time ?? record.Time),
    result: parseEnvResult(toText(record.result ?? record.number ?? record.Result)),
  };
}

function parseGamesFromJson(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.map(parseEnvGame).filter((game): game is EnvGameCard => game !== null);
  } catch {
    return null;
  }
}

function parseGamesFromPipe(raw: string): EnvGameCard[] {
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): EnvGameCard | null => {
      const [name, result, time] = chunk.split("|").map((part) => part.trim());

      if (!name) {
        return null;
      }

      return {
        name,
        time: normalizeResultSlotTime(time),
        result: parseEnvResult(result),
      };
    })
    .filter((game): game is EnvGameCard => game !== null);
}

function parseGamesFromNamedEnv() {
  const games: EnvGameCard[] = [
    {
      name: "Faridabad",
      time: process.env.FARIDABAD_TIME,
      result: process.env.FARIDABAD_RESULT,
    },
    {
      name: "Ghaziabad",
      time: process.env.GHAZIABAD_TIME,
      result: process.env.GHAZIABAD_RESULT,
    },
    {
      name: "Gali",
      time: process.env.GALI_TIME,
      result: process.env.GALI_RESULT,
    },
    {
      name: "Disawar",
      time: process.env.DISAWAR_TIME,
      result: process.env.DISAWAR_RESULT,
    },
  ]
    .map((game): EnvGameCard | null => {
      const hasConfig = Boolean(toText(game.time) || toText(game.result));

      if (!hasConfig) {
        return null;
      }

      return {
        name: game.name,
        time: normalizeResultSlotTime(game.time || "07:30 PM"),
        result: parseEnvResult(toText(game.result) || "XX"),
      };
    })
    .filter((game): game is EnvGameCard => game !== null);

  return games.length ? games : null;
}

export function getEnvGameCards(): EnvGameCard[] {
  const json = process.env.OTHER_GAMES_CARDS?.trim();

  if (json) {
    const fromJson = parseGamesFromJson(json);

    if (fromJson?.length) {
      return fromJson;
    }

    const fromPipe = parseGamesFromPipe(json);

    if (fromPipe.length) {
      return fromPipe;
    }
  }

  return parseGamesFromNamedEnv() ?? DEFAULT_ENV_GAMES;
}

export function buildEnvGameCardItems(): TodayResultItem[] {
  const todayKey = getIstTodayKey();

  return getEnvGameCards().map((game, index) => ({
    ResultId: `env-game-${index}`,
    ShiftId: String(index + 1),
    ShiftName: game.name,
    ShiftResultTime: normalizeResultSlotTime(game.time),
    ResultDate: todayKey,
    Result: game.result,
  }));
}
