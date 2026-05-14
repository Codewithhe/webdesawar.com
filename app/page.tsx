import { Suspense } from "react";
import LoadingSkeleton from "./components/loading-skeleton";
import JsonLd from "./components/seo/json-ld";
import ResultsWebsite from "./components/results-website";
import { getResultsData } from "./lib/results-data";
import { homeMetadata } from "./lib/seo/metadata";
import { createHomeStructuredData } from "./lib/seo/schema";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const revalidate = 30;

export const metadata = homeMetadata;

function hasRefreshParam(searchParams?: Record<string, string | string[] | undefined>) {
  return Boolean(searchParams?.refresh);
}

async function HomeResults({ searchParams }: { searchParams?: SearchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const data = await getResultsData({
    bypassCache: hasRefreshParam(resolvedSearchParams),
  });

  return <ResultsWebsite data={data} refreshAction="/" />;
}

export default function Home({ searchParams }: { searchParams?: SearchParams }) {
  return (
    <>
      <JsonLd data={createHomeStructuredData()} />
      <Suspense fallback={<LoadingSkeleton />}>
        <HomeResults searchParams={searchParams} />
      </Suspense>
    </>
  );
}
