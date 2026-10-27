"use client";
import EmptyState from "@/components/EmptyState";

import { useState } from "react";
import DateObject from "react-date-object";
import { PaymentType } from "@prisma/client";
import { usePaymentsPage } from "@/tanstack/query/paymentQuery";
import { Page, PageHeader, PageTitle, PageBody } from "@/components/layout/Page";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentTable } from "@/components/payment/PaymentTable";
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
import { PAYMENT_TYPE_LABELS } from "@/utils/paymentType";

const ANY_TYPE = "ALL";

/** Payments grow every month, so this list asks the server for one page at a
 *  time, filtered by the search box, a month and the payment method. */
export default function AllPaymentsPage() {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<DateObject | null>(null);
  const [type, setType] = useState<PaymentType | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const search = useDebouncedValue(query.trim());

  const { data, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    usePaymentsPage({
      page,
      limit: pageSize,
      search,
      type,
      ...monthRange(month),
    });

  // Every filter change starts again from the first page.
  const resetting =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <Page>
      <PageHeader className="space-y-4">
        <PageTitle>{labels.allPaymentsList}</PageTitle>
        <ListToolbar
          query={query}
          onQueryChange={resetting(setQuery)}
          placeholder={labels.searchPaymentsPlaceholder}
          pageSize={pageSize}
          onPageSizeChange={resetting(setPageSize)}
          matchCount={data?.totalCount}
        >
          <MonthFilter value={month} onChange={resetting(setMonth)} />
          <div className="space-y-2">
            <Label htmlFor="payment-type-filter">{labels.paymentMethod}</Label>
            <Select
              value={type ?? ANY_TYPE}
              onValueChange={(value) =>
                resetting(setType)(
                  value === ANY_TYPE ? undefined : (value as PaymentType)
                )
              }
            >
              <SelectTrigger id="payment-type-filter" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_TYPE}>{labels.anyPaymentMethod}</SelectItem>
                {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ListToolbar>
        {data && data.totalCount > 0 && (
          <p className="text-sm">
            {labels.filteredTotal}:{" "}
            <span className="font-semibold tabular-nums">
              {formatRial(data.totalAmount)}
            </span>
          </p>
        )}
      </PageHeader>
      <PageBody
        className={cn(
          "transition-opacity",
          isFetching && isPlaceholderData && "opacity-60"
        )}
        aria-busy={isFetching}
      >
        {isLoading ? (
          <LoadingComponent text={labels.loadingPayments} inline />
        ) : isError ? (
          <ErrorComponent
            error={error}
            message={labels.errorLoadingPayments}
            retry={refetch}
            inline
          />
        ) : data && data.rows.length > 0 ? (
          <>
            <PaymentTable payments={data.rows} />
            <Pager
              page={data.currentPage}
              totalPages={data.totalPages}
              onPageChange={setPage}
              disableNext={isPlaceholderData}
            />
          </>
        ) : (
          <EmptyState message={labels.paymentsNotFound} />
        )}
      </PageBody>
    </Page>
  );
}
