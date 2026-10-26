"use client";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import Pager from "@/components/Pager";

import React, { useState } from "react";

import { BankCardTransferTable } from "@/components/bank/BankCardTransferTable";
import { useGetAllCardTransfer } from "@/tanstack/query/bankQuery";
import { labels } from "@/utils/label";

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
    <div className="w-full mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">لیست کارت به کارت‌ها</h1>

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
    </div>
  );
}
