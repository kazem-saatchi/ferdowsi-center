"use client";
import EmptyState from "@/components/EmptyState";

import { useEffect } from "react";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { labels } from "@/utils/label";
import { ShopsBalanceTable } from "@/components/balance/ShopsBalanceTable";
import { ShopsBalanceToolbar } from "@/components/balance/ShopsBalanceToolbar";
import { useGetAllShopsBalance } from "@/tanstack/query/balanceQuery";
import { convertToShopsBalanceData } from "@/utils/calculateBalanceClient";
import Pager from "@/components/Pager";
import ListToolbar from "@/components/table/ListToolbar";
import { useClientList } from "@/hooks/useClientList";

export default function AllShopsMonthlyBalancePage() {
  const proprietor: boolean = false;

  const {
    data: response,
    isLoading,
    error,
    isError,
    refetch,
  } = useGetAllShopsBalance(proprietor);

  const { minDebt, setAllBalances, setAllBalanceDetails } = useStore(
    useShallow((state) => ({
      minDebt: state.allBalanceMinDebt,
      setAllBalances: state.setAllBalances,
      setAllBalanceDetails: state.setAllBalanceDetails,
    }))
  );

  const shopsData = response?.data?.shopsData;
  const lastBankTransactionDate = response?.data?.lastBankTransactionDate;

  // The debt threshold picked in the toolbar narrows the table as well as the
  // "filtered" downloads; the search box narrows only the table.
  const list = useClientList(
    shopsData,
    (shop) => [shop.plaque, shop.ownerName, shop.renterName],
    (shop) => minDebt === null || shop.totalBalance < -minDebt
  );

  // The store feeds the PDF/Excel exports, which read it on click.
  useEffect(() => {
    if (!shopsData) return;
    setAllBalances(convertToShopsBalanceData(shopsData));
    setAllBalanceDetails(shopsData);
  }, [shopsData, setAllBalances, setAllBalanceDetails]);

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError || !response?.success) {
    return (
      <ErrorComponent
        // A failed action resolves with success:false rather than throwing, so
        // react-query reports no error object — carry its message across.
        error={error ?? new Error(response?.message || labels.errorOccurred)}
        message={response?.message || labels.errorOccurred}
        retry={refetch}
      />
    );
  }

  const totalBalance = (shopsData ?? []).reduce(
    (sum, shop) => sum + shop.totalBalance,
    0
  );

  return (
    <Page>
      <PageHeader>
        <PageTitle>{labels.allShopsMonthlyBalance}</PageTitle>
      </PageHeader>
      <PageBody>
        <ShopsBalanceToolbar
          variant="monthly"
          totalBalance={totalBalance}
          lastBankTransactionDate={lastBankTransactionDate}
        />
        <div className="mb-4">
          <ListToolbar
            query={list.query}
            onQueryChange={list.setQuery}
            placeholder={labels.searchShopsPlaceholder}
            pageSize={list.pageSize}
            onPageSizeChange={list.setPageSize}
            matchCount={list.matchCount}
          />
        </div>
        {list.pageItems.length > 0 ? (
          <>
            <ShopsBalanceTable shopsBlances={list.pageItems} />
            <Pager
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
            />
          </>
        ) : (
          <EmptyState message={labels.noDataFound} />
        )}
      </PageBody>
    </Page>
  );
}
