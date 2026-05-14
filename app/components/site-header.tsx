"use client";

import { useState } from "react";
import BrandLogo from "./brand-logo";

type SiteHeaderProps = {
  siteName: string;
};

export default function SiteHeader({ siteName }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`site-header${open ? " is-open" : ""}`}>
      <div className="site-header-bar">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="brand" href="/" aria-label={`${siteName} home`}>
          <BrandLogo siteName={siteName} />
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-controls="primary-navigation"
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
      </div>
      <nav className="nav-links" id="primary-navigation" aria-label="Primary navigation">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" onClick={() => setOpen(false)}>
          Home
        </a>
        <a href="/month-chart" onClick={() => setOpen(false)}>
          Month Chart
        </a>
        <a href="/results" onClick={() => setOpen(false)}>
          All Results
        </a>
        <a className="admin-link" href="#" onClick={() => setOpen(false)}>
          Admin Login
        </a>
      </nav>
    </header>
  );
}
