import "server-only";

import { CATEGORY_NAME } from "./site";
import { normalizeCategory } from "./results";

/**
 * Redis keys used by api.mdresult.com public GET handlers (invalidate on POST /api/result).
 * Wire your backend DEL to these patterns after Mongo upsert.
 */
export function buildMiniBackendRedisKeys(options: {
  date: string;
  categoryname?: string;
  key?: string;
}) {
  const date = options.date.trim();
  const key = options.key?.trim() || "md-9281";
  const category = options.categoryname?.trim() || CATEGORY_NAME;
  const normalized = normalizeCategory(category);

  return [
    `result:${normalized}:${date}`,
    `result:minidesawer:${date}`,
    `result:minidesawar:${date}`,
    `result:${key}:${date}`,
    `result:md-9281:${date}`,
    `fetch-result-direct:${normalized}`,
    `fetch-result-direct:minidesawer`,
    `fetch-result-direct:${key}`,
    `results:${category}:${date}`,
    `results:Minidesawer:${date}`,
    `results:Mini Desawar:${date}`,
    `cache:result:${date}`,
    `cache:results:today`,
  ];
}

/** Optional POST to backend cache purge (set MINIBACKEND_CACHE_PURGE_URL on API server). */
export async function purgeMiniBackendRedisCache(options: {
  date: string;
  categoryname?: string;
  key?: string;
}) {
  const baseUrl = process.env.MINIBACKEND_BASE_URL?.trim().replace(/\/$/, "");
  const purgePath =
    process.env.MINIBACKEND_CACHE_PURGE_PATH?.trim() || "/api/cache/invalidate";
  const secret = process.env.MINIBACKEND_CACHE_PURGE_SECRET?.trim();

  if (!baseUrl || !secret) {
    return { purged: false, keys: buildMiniBackendRedisKeys(options) };
  }

  const keys = buildMiniBackendRedisKeys(options);

  try {
    const response = await fetch(`${baseUrl}${purgePath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ keys, date: options.date, categoryname: options.categoryname }),
      cache: "no-store",
    });

    return { purged: response.ok, keys };
  } catch {
    return { purged: false, keys };
  }
}
