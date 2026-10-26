import { useState } from "react";
import { matchesSearch, paginate } from "@/utils/listSearch";

export const DEFAULT_PAGE_SIZE = 25;

/** Search and paging for a list that is already fully loaded (units, persons).
 *  `searchFields` picks what the search box looks at in each row; `filter`
 *  applies any other filter the page has, such as unit type. Changing the
 *  query or the page size goes back to page 1; a page that changes its own
 *  filter calls `resetPage`. The lists are a few dozen rows, so filtering on
 *  every render costs nothing worth memoizing. */
export function useClientList<T>(
  items: T[] | null | undefined,
  searchFields: (item: T) => (string | number | null | undefined)[],
  filter?: (item: T) => boolean
) {
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const matching = (items ?? []).filter(
    (item) =>
      (!filter || filter(item)) && matchesSearch(query, searchFields(item))
  );
  const current = paginate(matching, page, pageSize);

  return {
    query,
    setQuery: (value: string) => {
      setQueryState(value);
      setPage(1);
    },
    pageSize,
    setPageSize: (value: number) => {
      setPageSizeState(value);
      setPage(1);
    },
    page: current.page,
    setPage,
    resetPage: () => setPage(1),
    totalPages: current.totalPages,
    pageItems: current.items,
    /** Every row that passes the search and filter, for exports. */
    matching,
    matchCount: matching.length,
  };
}
