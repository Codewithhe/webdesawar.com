import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isMiniDesawarCategoryName } from "../../lib/category-match";
import { purgeMiniBackendRedisCache } from "../../lib/mini-backend-cache";
import { normalizeResultSlotTime } from "../../lib/result-time";
import { CATEGORY_NAME, DEFAULT_RESULT_TIME, RESULTS_CACHE_TAG } from "../../lib/site";

type ResultSaveBody = {
  categoryname?: string;
  date?: string;
  time?: string;
  number?: string | number;
  next_result?: string;
  result?: Array<{ time?: string; number?: string | number }>;
  key?: string;
  phone?: string;
};

function getMiniBackendBaseUrl() {
  return process.env.MINIBACKEND_BASE_URL?.trim().replace(/\/$/, "") ?? "";
}

function normalizeSaveBody(body: ResultSaveBody) {
  const slot = normalizeResultSlotTime(body.time ?? body.next_result ?? DEFAULT_RESULT_TIME);
  const number = body.number === undefined || body.number === null ? "" : String(body.number).trim();

  const nested = Array.isArray(body.result) ? body.result : [];
  const result =
    nested.length > 0
      ? nested.map((entry) => ({
          time: normalizeResultSlotTime(entry.time ?? slot),
          number: entry.number === undefined || entry.number === null ? number : String(entry.number),
        }))
      : [{ time: slot, number }];

  return {
    categoryname: body.categoryname?.trim() || CATEGORY_NAME,
    date: body.date?.trim() ?? "",
    time: slot,
    number,
    next_result: normalizeResultSlotTime(body.next_result ?? slot),
    result,
    key: body.key?.trim() || "md-9281",
    phone: body.phone ?? "",
  };
}

/** Proxy to backend POST /api/result (DB + Redis). Homepage reads via GET /api/fetch-result. */
export async function POST(request: Request) {
  const baseUrl = getMiniBackendBaseUrl();

  if (!baseUrl) {
    return NextResponse.json({ message: "MINIBACKEND_BASE_URL is not configured" }, { status: 503 });
  }

  let body: ResultSaveBody;

  try {
    body = (await request.json()) as ResultSaveBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.date || body.number === undefined || body.number === null || body.number === "") {
    return NextResponse.json({ message: "Both date and number are required" }, { status: 400 });
  }

  if (!isMiniDesawarCategoryName(body.categoryname ?? CATEGORY_NAME)) {
    return NextResponse.json(
      { message: "categoryname must be Minidesawer / Mini Desawar" },
      { status: 400 }
    );
  }

  const payload = normalizeSaveBody(body);
  const authCode = process.env.MINIBACKEND_AUTH_CODE?.trim();

  if (!authCode) {
    return NextResponse.json(
      { message: "MINIBACKEND_AUTH_CODE is not configured on the website server" },
      { status: 503 }
    );
  }

  const upstream = await fetch(`${baseUrl}/api/result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, authcode: authCode }),
    cache: "no-store",
  });

  const text = await upstream.text();
  let json: unknown;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text || "Result save failed" };
  }

  if (upstream.ok) {
    revalidateTag(RESULTS_CACHE_TAG, "max");
    const purge = await purgeMiniBackendRedisCache({
      date: payload.date,
      categoryname: payload.categoryname,
      key: payload.key,
    });

    return NextResponse.json(
      {
        ...(typeof json === "object" && json ? json : { message: "Result saved successfully" }),
        revalidated: true,
        redisKeysInvalidated: purge.keys,
        redisPurged: purge.purged,
      },
      { status: upstream.status }
    );
  }

  return NextResponse.json(json, { status: upstream.status });
}
