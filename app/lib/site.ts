export const SITE_NAME = "Mini Desawar";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minidesawar.com";
export const SITE_TITLE = `${SITE_NAME} Result Today | Fast Live ${SITE_NAME} Updates`;
export const SITE_DESCRIPTION =
  "Check Mini Desawar result today, Mini Desawar fast result, Mini Desawar today result, and Desawar result history with evening updates around 7:30 PM IST.";
export const SEO_KEYWORDS = [
  "Mini Desawar",
  "Mini Desawar Result",
  "Mini Desawar Fast Result",
  "Mini Desawar Today Result",
  "Desawar Result",
  "Mini Desawar result today live",
  "Mini Desawar monthly chart",
  "Mini Desawar old result",
  "Mini Desawar evening result",
];
export const DEFAULT_RESULT_TIME = "07:30 PM";
export const RESULT_TIME_ZONE = "Asia/Kolkata";
export const RESULTS_REVALIDATE_SECONDS = 30;
export const RESULTS_CACHE_TAG = "mini-desawar-results";

export const CATEGORY_NAME = process.env.CATEGORY_NAME ?? "Minidesawer";

export const OTHER_GAME_PLACEHOLDERS = [
  { name: "Faridabad", time: "06:00 PM" },
  { name: "Ghaziabad", time: "09:25 PM" },
  { name: "Gali", time: "11:25 PM" },
  { name: "Disawar", time: "05:00 AM" },
] as const;
