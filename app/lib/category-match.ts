import { CATEGORY_NAME, SITE_NAME } from "./site";
import { normalizeCategory } from "./results";

const ALIASES = new Set([
  "minidesawer",
  "minidesawar",
  "minisdesawar",
  "minidesawr",
]);

/** True for Minidesawer / Mini Desawar spellings from the backend API. */
export function isMiniDesawarCategoryName(value: unknown) {
  const n = normalizeCategory(value);
  if (!n) return false;
  if (ALIASES.has(n)) return true;
  return n === normalizeCategory(CATEGORY_NAME) || n === normalizeCategory(SITE_NAME);
}
