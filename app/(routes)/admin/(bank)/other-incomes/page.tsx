// app/transactions/page.tsx
"use client"; // Required because we are using hooks (useQuery)

import React, { useState } from "react";

import { Button } from "@/components/ui/button"; // For pagination
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import {
  useGetAllIncomeTransfer,
} from "@/tanstack/query/bankQuery";
import { labels } from "@/utils/label";
import { BankOtherIncomeTable } from "@/components/bank/BankOtherIncomeTable";

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
  } = useGetAllIncomeTransfer({ page, limit });

  const transactions = queryResult?.data ?? [];
  const totalPages = queryResult?.totalPages ?? 0;

  return (
    <div className="w-full mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">تراکنش های بانکی</h1>

      {/* Display loading skeleton or table */}
      {isLoading && !queryResult ? (
        <div className="space-y-4 px-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <BankOtherIncomeTable
          transactions={transactions}
          isLoading={isFetching} // Show loading indicator during background fetches too
          isError={isError}
        />
      )}

      {/* Display error message */}
      {isError && (
        <p className="text-red-500 mt-4">
          Error fetching transactions:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}
      {isFetching && <p className="text-center mt-2">{labels.gettingData}</p>}

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
