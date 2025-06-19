"use client";

import { useEffect, useState } from "react";
import { useGetAllShopsBalance } from "@/tanstack/query/balanceQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { BalanceTable } from "@/components/balance/BalanceTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { Button } from "@/components/ui/button";
import { labels } from "@/utils/label";
import { ShopsBalanceTable } from "@/components/balance/ShopsBalanceTable";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/formatNumber";

export default function AllShopsMonthlyBalancePage() {
  const proprietor: boolean = false;

  const [totalBalance, setTotalBalance] = useState<number>(0);

  const { data, isLoading, isError, error, refetch } =
    useGetAllShopsBalance(proprietor);
  const {
    allBalances,
    setAllBalances,
    exportAllBalanceToExcel,
    exportAllBalanceToPdf,
  } = useStore(
    useShallow((state) => ({
      allBalances: state.allBalances,
      setAllBalances: state.setAllBalances,
      exportAllBalanceToPdf: state.exportAllBalanceToPDF,
      exportAllBalanceToExcel: state.exportAllBalanceToExcel,
    }))
  );

  useEffect(() => {
    if (data?.data?.shopsBalance) {
      setAllBalances(data?.data?.shopsBalance);
      const total = data.data.shopsBalance.reduce((total, current) => {
        return total + current.balance;
      }, 0);

      setTotalBalance(total);
    }
  }, [data, setAllBalances]);

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

  console.log("all shops balance", allBalances);

  return (
    <div>
      <CardHeader>
        <CardTitle>{labels.allShopsMonthlyBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex flex-col items-start justify-start",
            "lg:flex-row lg:justify-between lg:items-center",
            "w-full gap-2"
          )}
        >
          <div className="flex flex-row items-center justify-start gap-2">
            {labels.totalBalance}{"  : "}
            <span className="text-xl font-bold">
              {formatNumber(totalBalance)}
            </span>
          </div>
          <div className="flex flex-row items-center justify-start gap-2 mb-4">
            <Button onClick={exportAllBalanceToPdf}>
              {labels.downloadAsPDF}
            </Button>
            <Button onClick={exportAllBalanceToExcel}>
              {labels.downloadAsExcel}
            </Button>
          </div>
        </div>
        {allBalances && allBalances.length > 0 ? (
          <ShopsBalanceTable shopsBlances={allBalances} />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </div>
  );
}
