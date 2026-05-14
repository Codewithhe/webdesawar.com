import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { RESULTS_CACHE_TAG } from "../../lib/site";

const REQUIRED_ENV = [
  "MINIBACKEND_BASE_URL",
  "MINIBACKEND_AUTH_CODE",
  "CATEGORY_UPLOAD_KEY",
  "CATEGORY_NAME",
] as const;

type EveningResultBody = {
  date?: string;
  number?: string | number;
  result?: string;
  mode?: string;
};

function missingEnv() {
  return REQUIRED_ENV.filter((name) => !process.env[name]);
}

export async function POST(request: Request) {
  const missing = missingEnv();

  if (missing.length > 0) {
    return NextResponse.json(
      {
        message: `Missing server environment values: ${missing.join(", ")}`,
      },
      { status: 500 }
    );
  }

  let body: EveningResultBody;

  try {
    body = (await request.json()) as EveningResultBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.date || body.number === undefined || body.number === null || body.number === "") {
    return NextResponse.json({ message: "Both date and number are required" }, { status: 400 });
  }

  const res = await fetch(`${process.env.MINIBACKEND_BASE_URL}/api/ui-evening/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MINIBACKEND_AUTH_CODE}`,
      "X-Category-Key": process.env.CATEGORY_UPLOAD_KEY ?? "",
    },
    body: JSON.stringify({
      categoryname: process.env.CATEGORY_NAME,
      date: body.date,
      time: "07:30 PM",
      result: body.result || "ok",
      number: body.number,
      next_result: "07:30 PM",
      mode: body.mode || "manual",
    }),
  });

  const text = await res.text();
  let json: unknown;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text || "Evening result upload failed" };
  }

  if (res.ok) {
    revalidateTag(RESULTS_CACHE_TAG, "max");
  }

  return NextResponse.json(json, { status: res.status });
}
