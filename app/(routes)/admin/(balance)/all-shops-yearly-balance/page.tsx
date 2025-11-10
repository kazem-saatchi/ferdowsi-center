"use client";

import { useEffect, useState, useCallback } from "react";
import findBalanceAllShops from "@/app/api/actions/balance/getAllShopsBalance";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { Button } from "@/components/ui/button";
import { labels } from "@/utils/label";
import { ShopsBalanceYearlyTable } from "@/components/balance/ShopsBalanceYearlyTable";
import { ShopsBalanceData } from "@/schema/balanceSchema";

export default function AllShopsYearlyBalancePage() {
  const proprietor: boolean = true;
  const CHUNK_SIZE = 10;

  const [isLoadingChunks, setIsLoadingChunks] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [error, setError] = useState<any>(null);
  const [accumulatedData, setAccumulatedData] = useState<ShopsBalanceData[]>([]);
  
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

  const loadAllChunks = useCallback(async () => {
    try {
      setIsLoadingChunks(true);
      setError(null);
      setAccumulatedData([]);

      // First request to get total count
      const firstResponse = await findBalanceAllShops(proprietor, 0, CHUNK_SIZE);
      
      if (!firstResponse.success || !firstResponse.data) {
        throw new Error(firstResponse.message || "Failed to load balance data");
      }

      const totalCount = firstResponse.data.totalCount || 0;
      const firstChunk = firstResponse.data.shopsBalance || [];
      
      // Update with first chunk
      setAccumulatedData(firstChunk);
      setLoadingProgress(`Loading shops: ${firstChunk.length}/${totalCount}`);

      // Load remaining chunks
      const accumulated: ShopsBalanceData[] = [...firstChunk];
      
      for (let skip = CHUNK_SIZE; skip < totalCount; skip += CHUNK_SIZE) {
        setLoadingProgress(`Loading shops: ${skip}/${totalCount}`);
        
        const response = await findBalanceAllShops(proprietor, skip, CHUNK_SIZE);
        
        if (!response.success || !response.data?.shopsBalance) {
          throw new Error(response.message || "Failed to load chunk");
        }

        const chunk = response.data.shopsBalance;
        accumulated.push(...chunk);
        
        // Update incrementally
        setAccumulatedData([...accumulated]);
        setLoadingProgress(`Loading shops: ${accumulated.length}/${totalCount}`);
      }

      // Final update
      setAllBalances(accumulated);
      setLoadingProgress("");
      setIsLoadingChunks(false);
    } catch (err: any) {
      console.error("Error loading chunks:", err);
      setError(err);
      setIsLoadingChunks(false);
    }
  }, [proprietor, setAllBalances]);

  useEffect(() => {
    loadAllChunks();
  }, [loadAllChunks]);

  if (isLoadingChunks && accumulatedData.length === 0) {
    return <LoadingComponent text={loadingProgress || labels.loadingData} />;
  }

  if (error && accumulatedData.length === 0) {
    return (
      <ErrorComponent
        error={error}
        message={labels.errorOccurred}
        retry={loadAllChunks}
      />
    );
  }

  const displayData = accumulatedData.length > 0 ? accumulatedData : allBalances;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.allShopsYearlyBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingChunks && loadingProgress && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {loadingProgress}
            </p>
          </div>
        )}
        <div className="flex flex-row items-center justify-start gap-2 mb-4">
          <Button onClick={exportAllBalanceToPdf} disabled={isLoadingChunks}>
            {labels.downloadAsPDF}
          </Button>
          <Button onClick={exportAllBalanceToExcel} disabled={isLoadingChunks}>
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
