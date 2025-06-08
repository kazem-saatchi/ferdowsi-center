// app/transactions/page.tsx
"use client"; // Required because we are using hooks (useQuery)

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button"; // For pagination
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { getBankTransactions } from "@/app/api/actions/bank/getBankTransactions";
import { BankTransactionTable } from "@/components/bank/BankTransactionsTable";

import { AccountType } from "@prisma/client";

import { LimitSelector } from "@/components/bank/LimitSelector";
import AccountTypeSelector from "@/components/bank/AccountTypeSelector";
import { useGetAllBankTransactions } from "@/tanstack/query/bankQuery";

export default function TransactionsPage() {
  const [accountType, setAccountType] = useState<AccountType | undefined>(
    undefined
  );
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState(1);

  // Use TanStack Query to fetch data
  const {
    data: queryResult, // Rename data to avoid conflict
    isLoading,
    isError,
    error,
    isFetching, // Indicates background fetching for refetches/new pages
    isPlaceholderData, // Useful for pagination UX
  } = useGetAllBankTransactions({
    page,
    limit,
    sortBy: "date",
    sortOrder: "desc",
    accountType,
  });

  const transactions = queryResult?.data ?? [];
  const totalPages = queryResult?.totalPages ?? 0;

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
      </div>

      {/* Display loading skeleton or table */}
      {isLoading && !queryResult ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <BankTransactionTable
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

      {/* Optional: Show loading indicator during background refetches */}
      {/* {isFetching && <p className="text-center mt-2">Updating...</p>} */}
    </div>
  );
}
