"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LimitSelector } from "@/components/bank/LimitSelector";
import { formatNumber } from "@/utils/formatNumber";
import { labels } from "@/utils/label";

/** The row above a long list: a search box, the page's own filters (passed as
 *  children), how many rows match, and the page-size picker. Pair it with the
 *  Pager under the table. */
export default function ListToolbar({
  query,
  onQueryChange,
  placeholder,
  pageSize,
  onPageSizeChange,
  matchCount,
  children,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  /** Rows matching the search and filters; left out while still unknown. */
  matchCount?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative w-full sm:w-72">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label={labels.search}
          className="ps-9 pe-9 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute end-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => onQueryChange("")}
            aria-label={labels.clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {children}
      <div className="flex flex-wrap items-center gap-3 sm:ms-auto">
        {matchCount !== undefined && (
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(matchCount)} {labels.rowsFound}
          </span>
        )}
        <LimitSelector limit={pageSize} setLimit={onPageSizeChange} />
      </div>
    </div>
  );
}
