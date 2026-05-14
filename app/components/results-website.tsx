import HomeAutoRefresh from "./home-auto-refresh";
import ErrorState from "./error-state";
import HomeSeoSections from "./seo/home-seo-sections";
import ResultCard from "./result-card";
import ResultsTable from "./results-table";
import SiteHeader from "./site-header";
import { SITE_NAME, WHATSAPP_URL } from "../lib/site";
import { buildHomeCardItems } from "../lib/result-display";
import type { ResultsData } from "../lib/results-data";

type ResultsWebsiteProps = {
  chartOnly?: boolean;
  data: ResultsData;
  refreshAction: string;
};

function ContactBlock({ siteName }: { siteName: string }) {
  return (
    <section className="contact-block" aria-labelledby="contact-updates-title">
      <p>{siteName} ki official result updates yahin par show hongi.</p>
      <div className="finger-row" aria-hidden="true">
        👇👇👇👇
      </div>
      <p id="contact-updates-title" className="contact-title">
        {siteName}
      </p>
      <strong>Live Result Updates 7:30PM Evening</strong>
    </section>
  );
}

function RefreshForm({ action }: { action: string }) {
  return (
    <form action={action} method="get">
      <button className="refresh-btn" type="submit" name="refresh" value="1">
        Refresh Now ↻
      </button>
    </form>
  );
}

function Footer({ siteName }: { siteName: string }) {
  return (
    <footer className="footer">
      <div>
        <h2>{siteName}</h2>
        <p>
          {siteName} result today, fast result timing, and Desawar result history are published with
          crawlable server-rendered HTML for mobile and desktop visitors.
        </p>
      </div>
      <nav aria-label="Footer navigation">
        <h3>Quick Links</h3>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">Home</a>
        <a href="/month-chart">Monthly Chart</a>
        <a href="/results">All Results</a>
        <a href="/feed.xml">Results RSS</a>
      </nav>
      <div>
        <h3>Result Updates</h3>
        <p>
          Evening updates are refreshed on a short interval so {siteName} today result stays current
          without relying on heavy client-side rendering.
        </p>
      </div>
      <small>© 2026 {siteName}. All rights reserved.</small>
    </footer>
  );
}

export default function ResultsWebsite({
  chartOnly = false,
  data,
  refreshAction,
}: ResultsWebsiteProps) {
  const siteName = SITE_NAME;
  const homeCards = buildHomeCardItems(data.today, data.sourceRecent, data.featured, siteName);

  if (chartOnly) {
    return (
      <main className="page-shell compact">
        <SiteHeader siteName={siteName} />
        {data.status.type === "error" ? <ErrorState message={data.status.message} /> : null}
        <section className="month-chart-card">
          <h1>{siteName} Weekly Result Chart</h1>
          <ResultsTable variant="week" dates={data.weekPivot.dates} rows={data.weekPivot.rows} />
        </section>
        <Footer siteName={siteName} />
      </main>
    );
  }

  return (
    <main className="page-shell">
      <HomeAutoRefresh />
      <SiteHeader siteName={siteName} />

      <section className="result-section cards-below-header" aria-labelledby="today-results-heading">
        <h2 id="today-results-heading">Aaj ke Results</h2>
        <div className="today-grid">
          {homeCards.map((item, index) => (
            <ResultCard
              item={item}
              featured={index === 0}
              key={`${item.ResultId ?? "card"}-${item.ShiftId ?? index}-${item.ShiftName ?? "game"}`}
            />
          ))}
        </div>
        <RefreshForm action={refreshAction} />
      </section>

      <section className="hero-section" aria-labelledby="mini-desawar-primary-heading">
        <h1 id="mini-desawar-primary-heading">{siteName} Result Today Live</h1>
        <a
          className="whatsapp-btn"
          href={WHATSAPP_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="whatsapp-btn-icon" aria-hidden="true">
            <svg className="whatsapp-icon" viewBox="0 0 24 24">
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="whatsapp-btn-copy">अपनी गेम खेलने के लिए नीचे WhatsApp पर क्लिक करें।</span>
          <span className="whatsapp-btn-arrow" aria-hidden="true">
            →
          </span>
        </a>
        <p>
          Check {siteName} fast result, {siteName} today result, and Desawar result updates in one
          mobile-friendly page with evening draw timing around 7:30 PM IST.
        </p>
      </section>

      {data.status.type === "error" ? <ErrorState message={data.status.message} /> : null}

      <ContactBlock siteName={siteName} />

      <section className="chart-card" aria-labelledby="recent-results-heading">
        <h2 id="recent-results-heading">Recent Results</h2>
        <ResultsTable variant="recent" rows={data.recent} />
      </section>

      <section className="chart-card" aria-labelledby="week-results-heading">
        <h2 id="week-results-heading">Week Results</h2>
        <ResultsTable variant="week" dates={data.weekPivot.dates} rows={data.weekPivot.rows} />
        <div className="chart-actions">
          <a className="refresh-btn small" href="/month-chart">
            Full Chart
          </a>
        </div>
      </section>

      <HomeSeoSections />

      <section className="month-picker">
        <h2>Select Month Chart.</h2>
        <div>
          <a href="/month-chart">Monthly Chart</a>
        </div>
      </section>

      <Footer siteName={siteName} />
    </main>
  );
}
