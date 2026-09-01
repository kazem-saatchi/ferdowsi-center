"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button"; // For pagination
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { BankTransactionTable } from "@/components/bank/BankTransactionsTable";

import { AccountType } from "@prisma/client";

import { LimitSelector } from "@/components/bank/LimitSelector";
import AccountTypeSelector from "@/components/bank/AccountTypeSelector";
import { useGetAllBankTransactions } from "@/tanstack/query/bankQuery";
import BankTypeSelector from "@/components/bank/BankTypeSelector";
import BankTransactionFiltersCard from "@/components/bank/BankTransactionFilters";
import {
  BankTransactionFilters,
  BankTransactionSortField,
} from "@/utils/bankTransactionFilters";
import { labels } from "@/utils/label";
import { formatNumber } from "@/utils/formatNumber";

export default function TransactionsPage() {
  const [accountType, setAccountType] = useState<AccountType | undefined>(
    undefined
  );
  const [type, setType] = useState<"INCOME" | "PAYMENT" | undefined>(undefined);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState(1);

  // Date / amount / text filters, committed from the filter card. The two
  // button groups above stay separate because they apply on click.
  const [filters, setFilters] = useState<BankTransactionFilters>({});

  const [sortBy, setSortBy] = useState<BankTransactionSortField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Use TanStack Query to fetch data
  const {
    data: queryResult, // Rename data to avoid conflict
    isLoading,
    isError,
    error,
    isFetching, // Indicates background fetching for refetches/new pages
    isPlaceholderData, // Useful for pagination UX
  } = useGetAllBankTransactions({
    ...filters,
    page,
    limit,
    sortBy,
    sortOrder,
    accountType,
    type,
  });

  const transactions = queryResult?.data ?? [];
  const totalPages = queryResult?.totalPages ?? 0;
  const totalCount = queryResult?.totalCount ?? 0;

  // Any committed filter narrows the result set, so an empty table means
  // "nothing matched" rather than "no data" — worth saying differently.
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined
  );

  const handleApplyFilters = (next: BankTransactionFilters) => {
    setFilters(next);
    setPage(1); // A narrower result set makes the current page meaningless
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Clicking the active column flips direction; a new column starts descending,
  // which is what you want for both a date and an amount.
  const handleSort = (field: BankTransactionSortField) => {
    if (field === sortBy) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1); // Page 3 of the old order says nothing about the new one
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">تراکنش های بانکی</h1>
      <div className="flex fle-row items-center justify-start gap-4 p-4">
        <LimitSelector limit={limit} setLimit={setLimit} />
        <AccountTypeSelector
          accountType={accountType}
          setAccountType={setAccountType}
          isFetching={isFetching}
          setPage={setPage}
        />
        <BankTypeSelector
          type={type}
          setType={setType}
          isFetching={isFetching}
          setPage={setPage}
        />
      </div>

      <div className="mb-6">
        <BankTransactionFiltersCard
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          isFetching={isFetching}
        />
      </div>

      {/* Result count — the action has always returned it, nothing showed it */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground mb-2 text-right">
          {formatNumber(totalCount)} {labels.transactionsFoundSuffix}
        </p>
      )}

      {/* Display loading skeleton or table */}
      {isLoading && !queryResult ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !isFetching && totalCount === 0 && hasActiveFilters ? (
        <div className="rounded-md border p-4 text-right">
          <p>{labels.noTransactionMatchesFilters}</p>
        </div>
      ) : (
        <BankTransactionTable
          transactions={transactions}
          isLoading={isFetching} // Show loading indicator during background fetches too
          isError={isError}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {/* Display error message */}
      {isError && (
        <p className="text-red-500 mt-4">
          Error fetching transactions:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex items-center justify-center space-x-2 mt-6 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={page === 1}
          >
            قبلی
          </Button>
          <span className="text-sm font-medium">
            صفحه {queryResult?.currentPage ?? page} از {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Only advance if not on the last page OR if we have more data potentially coming
              if (!isPlaceholderData && page < totalPages) {
                setPage((old) => old + 1);
              }
            }}
            // Disable if on the last page and not fetching/keeping previous data
            disabled={isPlaceholderData || page >= totalPages}
          >
            بعدی
          </Button>
        </div>
      )}
    </div>
  );
}
