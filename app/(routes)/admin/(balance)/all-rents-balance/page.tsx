"use client";
import EmptyState from "@/components/EmptyState";

import { ShopsBalanceTable } from "@/components/balance/ShopsBalanceTable";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { Button } from "@/components/ui/button";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import { useStore } from "@/store/store";
import { useGetAllRentsBalance } from "@/tanstack/query/balanceQuery";
import { labels } from "@/utils/label";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import Pager from "@/components/Pager";
import ListToolbar from "@/components/table/ListToolbar";
import { useClientList } from "@/hooks/useClientList";

export default function AllRentsBalancePage() {
  const {
    data: rentData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllRentsBalance();

  const {
    allBalances,
    setAllBalances,
    exportShopsBalanceToExcel,
    exportAllBalanceToPdf,
  } = useStore(
    useShallow((state) => ({
      allBalances: state.allBalances,
      setAllBalances: state.setAllBalances,
      exportAllBalanceToPdf: state.exportAllBalanceToPDF,
      exportShopsBalanceToExcel: state.exportShopsBalanceToExcel,
    }))
  );

  const lastBankTransactionDate = rentData?.data?.lastBankTransactionDate;

  const list = useClientList(allBalances, (shop) => [
    shop.plaque,
    shop.ownerName,
    shop.renterName,
  ]);

  useEffect(() => {
    if (rentData?.data?.shopsBalance) {
      setAllBalances(rentData?.data?.shopsBalance);
    }
  }, [rentData, setAllBalances]);

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        error={error}
        message={labels.errorOccurred}
        retry={refetch}
      />
    );
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>{labels.allRentsBalance}</PageTitle>
      </PageHeader>
      <PageBody>
        <div className="flex flex-row items-center justify-start gap-2 mb-4">
          <Button onClick={exportAllBalanceToPdf}>
            {labels.downloadAsPDF}
          </Button>
          <Button
            onClick={() =>
              void exportShopsBalanceToExcel({
                variant: "rent",
                lastBankTransactionDate,
              })
            }
          >
            {labels.downloadAsExcel}
          </Button>
        </div>
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
