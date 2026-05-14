import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES } from "./lib/seo/routes";
import { SITE_URL } from "./lib/site";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
