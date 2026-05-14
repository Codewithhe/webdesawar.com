import { SITE_NAME } from "../lib/site";
import BrandLogo from "./brand-logo";

export default function LoadingSkeleton() {
  return (
    <main className="page-shell" aria-busy="true">
      <header className="site-header">
        <div className="brand">
          <BrandLogo siteName={SITE_NAME} />
        </div>
        <div className="skeleton-nav" />
      </header>

      <section className="result-section cards-below-header">
        <h2>Aaj ke Results</h2>
        <div className="today-grid">
          {[1, 2].map((item) => (
            <article className={`today-card skeleton${item === 1 ? " featured-card" : ""}`} key={item}>
              <span>Loading</span>
              <strong className="result">--</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
