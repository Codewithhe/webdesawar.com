import { Suspense } from "react";
import LoadingSkeleton from "../components/loading-skeleton";
import JsonLd from "../components/seo/json-ld";
import ResultsWebsite from "../components/results-website";
import { getResultsData } from "../lib/results-data";
import { monthChartMetadata } from "../lib/seo/metadata";
import { createMonthChartStructuredData } from "../lib/seo/schema";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const revalidate = 30;

export const metadata = monthChartMetadata;

function hasRefreshParam(searchParams?: Record<string, string | string[] | undefined>) {
  return Boolean(searchParams?.refresh);
}

async function MonthChartResults({ searchParams }: { searchParams?: SearchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const data = await getResultsData({
    bypassCache: hasRefreshParam(resolvedSearchParams),
  });

  return <ResultsWebsite chartOnly data={data} refreshAction="/month-chart" />;
}

export default function MonthChart({ searchParams }: { searchParams?: SearchParams }) {
  return (
    <>
      <JsonLd data={createMonthChartStructuredData()} />
      <Suspense fallback={<LoadingSkeleton />}>
        <MonthChartResults searchParams={searchParams} />
      </Suspense>
    </>
  );
}
