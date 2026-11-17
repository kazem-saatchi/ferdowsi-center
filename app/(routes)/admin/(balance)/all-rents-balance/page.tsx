"use client";
import EmptyState from "@/components/EmptyState";

import { RentsBalanceTable } from "@/components/balance/RentsBalanceTable";
import { RentsBalanceSummary } from "@/components/balance/RentsBalanceSummary";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import { useGetAllRentsBalance } from "@/tanstack/query/balanceQuery";
import { labels } from "@/utils/label";
import { shopTypeLabel } from "@/utils/shopType";
import {
  RENT_STATUS_LABELS,
  rentStatus,
  RentSort,
  RentStatus,
  sortRentBalances,
  summarizeRentBalances,
} from "@/utils/rentBalance";
import {
  exportRentsBalanceToExcel,
  exportRentsBalanceToPDF,
} from "@/utils/rentBalanceExport";
import { useMemo, useState } from "react";
import Pager from "@/components/Pager";
import ListToolbar from "@/components/table/ListToolbar";
import { useClientList } from "@/hooks/useClientList";

const RENT_TYPES = ["BOARD", "PARKING"] as const;
type RentTypeFilter = (typeof RENT_TYPES)[number] | "all";

const SORT_LABELS: Record<RentSort, string> = {
  plaque: labels.rentSortPlaque,
  debt: labels.rentSortDebt,
  monthsBehind: labels.rentSortMonthsBehind,
};

export default function AllRentsBalancePage() {
  const {
    data: rentData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllRentsBalance();

  const [typeFilter, setTypeFilter] = useState<RentTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<RentStatus | "all">("all");
  const [sort, setSort] = useState<RentSort>("plaque");

  const rows = rentData?.data?.shopsBalance;
  const lastBankTransactionDate = rentData?.data?.lastBankTransactionDate;

  const sortedRows = useMemo(
    () => (rows ? sortRentBalances(rows, sort) : undefined),
    [rows, sort]
  );

  const list = useClientList(
    sortedRows,
    (shop) => [shop.plaque, shop.ownerName, shop.renterName],
    (shop) =>
      (typeFilter === "all" || shop.type === typeFilter) &&
      (statusFilter === "all" || rentStatus(shop.balance) === statusFilter)
  );

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError || !rentData?.success) {
    return (
      <ErrorComponent
        // A failed action resolves with success:false rather than throwing.
        error={error ?? new Error(rentData?.message || labels.errorOccurred)}
        message={rentData?.message || labels.errorOccurred}
        retry={refetch}
      />
    );
  }

  const summary = summarizeRentBalances(list.matching);

  return (
    <Page>
      <PageHeader>
        <PageTitle>{labels.allRentsBalance}</PageTitle>
      </PageHeader>
      <PageBody>
        {/* Downloads cover every unit in plaque order, whatever the filters. */}
        <div className="flex flex-row items-center justify-start gap-2 mb-4">
          <Button
            disabled={!rows?.length}
            onClick={() => exportRentsBalanceToPDF(rows ?? [])}
          >
            {labels.downloadAsPDF}
          </Button>
          <Button
            disabled={!rows?.length}
            onClick={() =>
              void exportRentsBalanceToExcel(rows ?? [], lastBankTransactionDate)
            }
          >
            {labels.downloadAsExcel}
          </Button>
        </div>
        <RentsBalanceSummary
          summary={summary}
          lastBankTransactionDate={lastBankTransactionDate}
        />
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as RentTypeFilter);
              list.resetPage();
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]" aria-label={labels.type}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.rentAllTypes}</SelectItem>
              {RENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {shopTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as RentStatus | "all");
              list.resetPage();
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]" aria-label={labels.status}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.rentAllStatuses}</SelectItem>
              {(Object.keys(RENT_STATUS_LABELS) as RentStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {RENT_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value as RentSort);
              list.resetPage();
            }}
          >
            <SelectTrigger
              className="w-full sm:w-[180px]"
              aria-label={labels.sortByColumn}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as RentSort[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <RentsBalanceTable rows={list.pageItems} />
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
