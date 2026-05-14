import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { RESULTS_CACHE_TAG } from "../../lib/site";

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json({ message: "Revalidation is not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(RESULTS_CACHE_TAG, "max");

  return NextResponse.json({ revalidated: true });
}
