import { getResultsData } from "../lib/results-data";
import { absoluteUrl } from "../lib/seo/metadata";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";
import { displayResult, formatResultTime } from "../lib/result-display";

export const revalidate = 300;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const data = await getResultsData();
  const items = data.today.length
    ? data.today
    : data.recent.map((row) => ({
        title: row.ShiftName ?? "Result",
        date: row.Date2 ?? row.Date1 ?? "",
        time: row.ShiftResultTime ?? "",
        number: displayResult(row.Result2 ?? row.Result1),
        guid: `${row.ShiftId}-${row.AddDate}`,
      }));
  const updatedAt = new Date().toUTCString();

  const feedItems = items
    .slice(0, 20)
    .map((row) => {
      const title =
        "title" in row
          ? `${row.title} ${row.number}`
          : `${SITE_NAME} result ${row.ResultDate ?? "update"} ${displayResult(row.Result)}`.trim();
      const description =
        "title" in row
          ? `${row.title} result on ${row.date} at ${formatResultTime(row.time)}.`
          : `${SITE_NAME} result on ${row.ResultDate ?? "latest draw"} at ${formatResultTime(row.ShiftResultTime)}.`;
      const guid =
        "guid" in row
          ? row.guid
          : `${row.ResultId || row.ResultDate}-${row.ShiftResultTime}-${row.Result}`;

      return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${absoluteUrl("/")}</link>
      <guid isPermaLink="false">${escapeXml(String(guid))}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${updatedAt}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} Results</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-in</language>
    <lastBuildDate>${updatedAt}</lastBuildDate>${feedItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
