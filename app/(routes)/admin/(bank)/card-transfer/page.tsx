"use client";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import Pager from "@/components/Pager";

import React, { useState } from "react";

import { BankCardTransferTable } from "@/components/bank/BankCardTransferTable";
import { useGetAllCardTransfer } from "@/tanstack/query/bankQuery";
import { labels } from "@/utils/label";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const limit = 20; // Number of items per page

  // Use TanStack Query to fetch data
  const {
    data: queryResult, // Rename data to avoid conflict
    isLoading,
    isError,
    error,
    isFetching, // Indicates background fetching for refetches/new pages
    isPlaceholderData, // Useful for pagination UX
  } = useGetAllCardTransfer({ page, limit });

  const transactions = queryResult?.data ?? [];
  const totalPages = queryResult?.totalPages ?? 0;

  return (
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>لیست کارت به کارت‌ها</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
        {/* Display loading skeleton or table */}
        {isLoading && !queryResult ? (
          <LoadingComponent inline />
        ) : (
          <BankCardTransferTable
            transactions={transactions}
            isLoading={isFetching} // Show loading indicator during background fetches too
            isError={isError}
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
