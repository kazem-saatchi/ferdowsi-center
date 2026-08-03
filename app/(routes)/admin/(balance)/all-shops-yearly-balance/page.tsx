"use client";

import { useEffect } from "react";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { Button } from "@/components/ui/button";
import { labels } from "@/utils/label";
import { ShopsBalanceYearlyTable } from "@/components/balance/ShopsBalanceYearlyTable";
import { useGetAllShopsBalance } from "@/tanstack/query/balanceQuery";
import { convertToShopsBalanceData } from "@/utils/calculateBalanceClient";

export default function AllShopsYearlyBalancePage() {
  const proprietor: boolean = true;

  const {
    data: response,
    isLoading,
    error,
    isError,
    refetch,
  } = useGetAllShopsBalance(proprietor);

  const {
    setAllBalances,
    setAllBalanceDetails,
    exportAllBalanceToExcel,
    exportAllBalanceToPdf,
  } = useStore(
    useShallow((state) => ({
      setAllBalances: state.setAllBalances,
      setAllBalanceDetails: state.setAllBalanceDetails,
      exportAllBalanceToPdf: state.exportAllBalanceToPDF,
      exportAllBalanceToExcel: state.exportAllBalanceToExcel,
    }))
  );

  const shopsData = response?.data?.shopsData;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.allShopsYearlyBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-start gap-2 mb-4">
          <Button onClick={exportAllBalanceToPdf} disabled={isLoading}>
            {labels.downloadAsPDF}
          </Button>
          <Button onClick={exportAllBalanceToExcel} disabled={isLoading}>
            {labels.downloadAsExcel}
          </Button>
        </div>
        {shopsData && shopsData.length > 0 ? (
          <ShopsBalanceYearlyTable shopsBlances={shopsData} />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </Card>
  );
}
