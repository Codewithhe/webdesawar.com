import type { MetadataRoute } from "next";
import { ROBOTS_DISALLOWED_PATHS } from "./lib/seo/routes";
import { SITE_URL } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOWED_PATHS],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: new URL(SITE_URL).host,
  };
}
