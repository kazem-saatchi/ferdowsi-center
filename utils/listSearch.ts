import { normalizeForSearch } from "@/utils/formatNumber";

/** Does a row match what was typed in a list's search box? Every word of the
 *  query has to appear in at least one of the fields, so "علی ۱۰۲" finds Ali's
 *  row for unit 102. Digits match whichever script they were typed or stored
 *  in. An empty query matches everything. */
export function matchesSearch(
  query: string,
  fields: (string | number | null | undefined)[]
): boolean {
  const words = searchWords(query);
  if (words.length === 0) return true;
  const haystack = fields
    .filter((field) => field !== null && field !== undefined && field !== "")
    .map((field) => normalizeForSearch(String(field)));
  return words.every((word) => haystack.some((field) => field.includes(word)));
}

/** The query split into normalized words, empty ones dropped. */
export function searchWords(query: string): string[] {
  return normalizeForSearch(query).split(/\s+/).filter(Boolean);
}

/** Clamp `page` into 1..totalPages and slice it out of `items`. */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  return {
    page: current,
    totalPages,
    items: items.slice((current - 1) * pageSize, current * pageSize),
  };
}
