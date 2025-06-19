"use client";

import { ShopsBalanceTable } from "@/components/balance/ShopsBalanceTable";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/store";
import { useGetAllRentsBalance } from "@/tanstack/query/balanceQuery";
import { labels } from "@/utils/label";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

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
    <Card>
      <CardHeader>
        <CardTitle>{labels.allShopsMonthlyBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-start gap-2 mb-4">
          <Button onClick={exportAllBalanceToPdf}>
            {labels.downloadAsPDF}
          </Button>
          <Button onClick={exportAllBalanceToExcel}>
            {labels.downloadAsExcel}
          </Button>
        </div>
        {allBalances && allBalances.length > 0 ? (
          <ShopsBalanceTable shopsBlances={allBalances} />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </Card>
  );
}
