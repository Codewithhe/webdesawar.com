import { NextResponse } from "next/server";
import { getMiniDesawarData } from "../../lib/mini-desawar-data";
import { getIstTodayKey } from "../../lib/result-display";

/** Debug + health: returns parsed Minidesawar rows used by the homepage. */
export async function GET() {
  const data = await getMiniDesawarData([getIstTodayKey()], { bypassCache: true });

  return NextResponse.json(
    {
      featured: data.featured,
      recent: data.recent,
      week: data.week,
      weekDates: data.weekDates,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
