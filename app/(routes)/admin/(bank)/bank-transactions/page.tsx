"use client";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import Pager from "@/components/Pager";

import { useState } from "react";

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
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>تراکنش‌های بانکی</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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
          <p className="text-sm text-muted-foreground mb-2 text-start">
            {formatNumber(totalCount)} {labels.transactionsFoundSuffix}
          </p>
        )}

        {/* Display loading skeleton or table */}
        {isLoading && !queryResult ? (
          <LoadingComponent inline />
        ) : !isFetching && totalCount === 0 && hasActiveFilters ? (
          <div className="rounded-md border p-4 text-start">
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
          <ErrorComponent inline
            error={error instanceof Error ? error : null}
          />
        )}

        {/* Pagination Controls */}
        <Pager
          page={queryResult?.currentPage ?? page}
          totalPages={totalPages}
          onPageChange={setPage}
          disableNext={isPlaceholderData}
        />
      </CardContent>
    </div>
  );
}
