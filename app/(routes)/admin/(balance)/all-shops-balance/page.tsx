"use client";

import { useEffect } from "react";
import { useGetAllShopsBalance } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { BalanceTable } from "@/components/balance/BalanceTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { Button } from "@/components/ui/button";
import { labels } from "@/utils/label";
import { ShopsBalanceTable } from "@/components/balance/ShopsBalanceTable";

export default function AllShopsBalancePage() {
  const { data, isLoading, isError, error, refetch } = useGetAllShopsBalance();
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
    <Card>
      <CardHeader>
        <CardTitle>{labels.allShopsBalance}</CardTitle>
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
