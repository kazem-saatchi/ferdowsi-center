"use client";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import Pager from "@/components/Pager";
import AccountTypeSelector from "@/components/bank/AccountTypeSelector";
import { BankTransactionCostTable } from "@/components/bank/BankTransactionsCostTable";
import { LimitSelector } from "@/components/bank/LimitSelector";
import { useGetAllBankTransactions } from "@/tanstack/query/bankQuery";
import { AccountType } from "@prisma/client";
import React, { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function BankCostListPage() {
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
    type: "PAYMENT",
  });

  const transactions = queryResult?.data ?? [];
  const totalPages = queryResult?.totalPages ?? 0;

  return (
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>لیست هزینه‌های بانکی</CardTitle>
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
        </div>

        {/* Display loading skeleton or table */}
        {isLoading && !queryResult ? (
          <LoadingComponent inline />
        ) : (
          <BankTransactionCostTable
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

        {/* Optional: Show loading indicator during background refetches */}
        {/* {isFetching && <p className="text-center mt-2">Updating...</p>} */}
      </CardContent>
    </div>
  );
}

export default BankCostListPage;
