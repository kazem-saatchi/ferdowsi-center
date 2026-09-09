"use client";

import { useEffect } from "react";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { labels } from "@/utils/label";
import { ShopsBalanceYearlyTable } from "@/components/balance/ShopsBalanceYearlyTable";
import { ShopsBalanceToolbar } from "@/components/balance/ShopsBalanceToolbar";
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

  const { setAllBalances, setAllBalanceDetails } = useStore(
    useShallow((state) => ({
      setAllBalances: state.setAllBalances,
      setAllBalanceDetails: state.setAllBalanceDetails,
    }))
  );

  const shopsData = response?.data?.shopsData;
  const lastBankTransactionDate = response?.data?.lastBankTransactionDate;

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
    <div>
      <CardHeader>
        <CardTitle>{labels.allShopsYearlyBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        <ShopsBalanceToolbar
          variant="yearly"
          totalBalance={totalBalance}
          lastBankTransactionDate={lastBankTransactionDate}
        />
        {shopsData && shopsData.length > 0 ? (
          <ShopsBalanceYearlyTable shopsBlances={shopsData} />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </div>
  );
}
