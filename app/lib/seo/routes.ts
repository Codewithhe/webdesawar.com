export const PUBLIC_ROUTES = [
  {
    path: "/",
    changeFrequency: "daily" as const,
    priority: 1,
  },
  {
    path: "/month-chart",
    changeFrequency: "daily" as const,
    priority: 0.8,
  },
] as const;

export const ROBOTS_DISALLOWED_PATHS = ["/api/", "/admin/"] as const;
