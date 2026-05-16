import HomeAutoRefresh from "./home-auto-refresh";
import ErrorState from "./error-state";
import HomeSeoSections from "./seo/home-seo-sections";
import ResultCard from "./result-card";
import ResultsTable from "./results-table";
import SiteDisclaimer from "./site-disclaimer";
import SiteHeader from "./site-header";
import { SITE_NAME, WHATSAPP_URL } from "../lib/site";
import WhatsAppIcon from "./whatsapp-icon";
import { buildHomeDisplayItems } from "../lib/result-display";
import ResultStrip from "./result-strip";
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
  const homeDisplay = buildHomeDisplayItems(
    data.today,
    data.sourceRecent,
    data.featured,
    siteName,
    data.envCards
  );

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
        <div className="results-display">
          <ResultCard item={homeDisplay.featured} featured />
          {homeDisplay.priorityStrips.length ? (
            <div className="result-strip-list result-strip-list-priority">
              {homeDisplay.priorityStrips.map((item, index) => (
                <ResultStrip
                  item={item}
                  key={`priority-${item.ResultId ?? "strip"}-${item.ShiftId ?? index}-${item.ShiftName ?? "game"}`}
                />
              ))}
            </div>
          ) : null}
          {homeDisplay.strips.length ? (
            <div className="result-strip-list">
              {homeDisplay.strips.map((item, index) => (
                <ResultStrip
                  item={item}
                  key={`${item.ResultId ?? "strip"}-${item.ShiftId ?? index}-${item.ShiftName ?? "game"}`}
                />
              ))}
            </div>
          ) : null}
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
            <WhatsAppIcon />
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

      <SiteDisclaimer />

      <Footer siteName={siteName} />
    </main>
  );
}
