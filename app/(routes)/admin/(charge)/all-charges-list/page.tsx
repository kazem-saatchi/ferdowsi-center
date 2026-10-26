"use client";
import EmptyState from "@/components/EmptyState";

import { useState } from "react";
import DateObject from "react-date-object";
import { useChargesPage } from "@/tanstack/query/chargeQuery";
import { ChargeTable } from "@/components/charge/ChargeTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import Pager from "@/components/Pager";
import ListToolbar from "@/components/table/ListToolbar";
import MonthFilter, { monthRange } from "@/components/calendar/MonthFilter";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DEFAULT_PAGE_SIZE } from "@/hooks/useClientList";
import { cn } from "@/lib/utils";
import { formatRial } from "@/utils/formatNumber";
import { labels } from "@/utils/label";

/** Charges grow by a full round every month, so this list asks the server for
 *  one page at a time, filtered by the search box and a month. */
export default function AllChargesPage() {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<DateObject | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const search = useDebouncedValue(query.trim());

  const { data, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    useChargesPage({ page, limit: pageSize, search, ...monthRange(month) });

  // Every filter change starts again from the first page.
  const resetting =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>{labels.allChargesTitle}</CardTitle>
        <ListToolbar
          query={query}
          onQueryChange={resetting(setQuery)}
          placeholder={labels.searchChargesPlaceholder}
          pageSize={pageSize}
          onPageSizeChange={resetting(setPageSize)}
          matchCount={data?.totalCount}
        >
          <MonthFilter value={month} onChange={resetting(setMonth)} />
        </ListToolbar>
        {data && data.totalCount > 0 && (
          <p className="text-sm">
            {labels.filteredTotal}:{" "}
            <span className="font-semibold tabular-nums">
              {formatRial(data.totalAmount)}
            </span>
          </p>
        )}
      </CardHeader>
      <CardContent
        className={cn(
          "p-3 pt-0 sm:p-6 sm:pt-0 transition-opacity",
          isFetching && isPlaceholderData && "opacity-60"
        )}
        aria-busy={isFetching}
      >
        {isLoading ? (
          <LoadingComponent inline />
        ) : isError ? (
          <ErrorComponent
            error={error}
            message={labels.errorOccurred}
            retry={refetch}
            inline
          />
        ) : data && data.rows.length > 0 ? (
          <>
            <ChargeTable charges={data.rows} />
            <Pager
              page={data.currentPage}
              totalPages={data.totalPages}
              onPageChange={setPage}
              disableNext={isPlaceholderData}
            />
          </>
        ) : (
          <EmptyState message={labels.chargesNotFound} />
        )}
      </CardContent>
    </Card>
  );
}
