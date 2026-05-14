import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import JsonLd from "./components/seo/json-ld";
import "./globals.css";
import { rootMetadata } from "./lib/seo/metadata";
import { createOrganizationSchema, createWebSiteSchema } from "./lib/seo/schema";
import { SITE_NAME } from "./lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  ...rootMetadata,
  alternates: {
    ...rootMetadata.alternates,
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} Results RSS` }],
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#081121",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className={inter.variable}>
        <JsonLd data={[createWebSiteSchema(), createOrganizationSchema()]} />
        {children}
      </body>
    </html>
  );
}
