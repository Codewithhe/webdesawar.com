import { Suspense } from "react";
import LoadingSkeleton from "../components/loading-skeleton";
import ResultsExplorer from "../components/results-explorer";
import SiteHeader from "../components/site-header";
import { getResultsData } from "../lib/results-data";
import { SITE_NAME } from "../lib/site";
import type { Metadata } from "next";

export const revalidate = 30;

export const metadata: Metadata = {
  title: `All Results | ${SITE_NAME}`,
  description: `Search and sort live ${SITE_NAME} result updates by game name, date, and time.`,
};

async function ResultsPageContent() {
  const data = await getResultsData();
  const rows = data.today.length ? data.today : data.recent.map((item) => ({
    ShiftId: item.ShiftId,
    ShiftName: item.ShiftName,
    ShiftResultTime: item.ShiftResultTime,
    ShiftColor: item.ShiftColor,
    ResultDate: item.Date2 ?? item.Date1,
    Result: item.Result2 ?? item.Result1,
  }));

  return (
    <main className="page-shell compact">
      <SiteHeader siteName={SITE_NAME} />

      <section className="hero-section">
        <h1>All Results</h1>
        <p>Search by game name and sort by result date or shift time.</p>
      </section>

      <ResultsExplorer rows={rows} />
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ResultsPageContent />
    </Suspense>
  );
}
