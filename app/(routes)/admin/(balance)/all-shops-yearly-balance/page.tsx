"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import findBalanceAllShops from "@/app/api/actions/balance/getAllShopsBalance";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { Button } from "@/components/ui/button";
import { labels } from "@/utils/label";
import { ShopsBalanceYearlyTable } from "@/components/balance/ShopsBalanceYearlyTable";
import {
  RawTransactionShopData,
  ShopBalanceDetails,
} from "@/schema/balanceSchema";
import {
  calculateAllShopsBalanceDetailsOnClient,
  convertToShopsBalanceData,
} from "@/utils/calculateBalanceClient";

export default function AllShopsYearlyBalancePage() {
  const proprietor: boolean = true;
  const BATCH_SIZE = 10;
  const hasStartedLoading = useRef(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [error, setError] = useState<any>(null);
  const [accumulatedData, setAccumulatedData] = useState<ShopBalanceDetails[]>(
    []
  );

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

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAccumulatedData([]);
      setLoadingProgress("Fetching initial data...");

      // First request to get total count
      const firstResponse = await findBalanceAllShops(
        proprietor,
        0,
        BATCH_SIZE
      );

      if (!firstResponse.success || !firstResponse.data) {
        throw new Error(firstResponse.message || "Failed to load balance data");
      }

      const totalCount = firstResponse.data.totalCount || 0;
      const firstBatch =
        (firstResponse.data.shopsData as RawTransactionShopData[]) || [];

      // Calculate all three balance types for first batch on client side
      // proprietor=true for yearly balances
      const firstCalculated = calculateAllShopsBalanceDetailsOnClient(
        firstBatch,
        proprietor
      );

      setAccumulatedData(firstCalculated);
      setLoadingProgress(
        `Loading shops: ${firstCalculated.length}/${totalCount}`
      );

      const accumulated: ShopBalanceDetails[] = [...firstCalculated];

      // Load remaining batches progressively
      for (let skip = BATCH_SIZE; skip < totalCount; skip += BATCH_SIZE) {
        setLoadingProgress(`Loading shops: ${skip}/${totalCount}`);

        const response = await findBalanceAllShops(
          proprietor,
          skip,
          BATCH_SIZE
        );

        if (!response.success || !response.data?.shopsData) {
          throw new Error(response.message || "Failed to load batch");
        }

        const batchRawData = response.data
          .shopsData as RawTransactionShopData[];
        const batchCalculated = calculateAllShopsBalanceDetailsOnClient(
          batchRawData,
          proprietor
        );

        accumulated.push(...batchCalculated);

        // Update incrementally
        setAccumulatedData([...accumulated]);
        setLoadingProgress(
          `Loading shops: ${accumulated.length}/${totalCount}`
        );
      }

      // Final update - convert to ShopsBalanceData for store compatibility
      setAllBalances(convertToShopsBalanceData(accumulated));
      setLoadingProgress("");
      setIsLoading(false);

      console.log(
        "All batches loaded and calculated on client:",
        accumulated.length,
        "shops"
      );
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err);
      setIsLoading(false);
    }
  }, [proprietor, setAllBalances]);

  useEffect(() => {
    // Prevent loading data multiple times
    if (!hasStartedLoading.current) {
      hasStartedLoading.current = true;
      loadAllData();
    }
  }, [loadAllData]);

  if (isLoading && accumulatedData.length === 0) {
    return <LoadingComponent text={loadingProgress || labels.loadingData} />;
  }

  if (error && accumulatedData.length === 0) {
    return (
      <ErrorComponent
        error={error}
        message={labels.errorOccurred}
        retry={loadAllData}
      />
    );
  }

  // Convert accumulated data for display (shows all three balance types)
  const displayData =
    accumulatedData.length > 0 ? accumulatedData : allBalances || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.allShopsYearlyBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && loadingProgress && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {loadingProgress}
            </p>
          </div>
        )}
        <div className="flex flex-row items-center justify-start gap-2 mb-4">
          <Button onClick={exportAllBalanceToPdf} disabled={isLoading}>
            {labels.downloadAsPDF}
          </Button>
          <Button onClick={exportAllBalanceToExcel} disabled={isLoading}>
            {labels.downloadAsExcel}
          </Button>
        </div>
        {displayData && displayData.length > 0 ? (
          <ShopsBalanceYearlyTable shopsBlances={displayData} />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </Card>
  );
}
