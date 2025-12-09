"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import findBalanceAllShops from "@/app/api/actions/balance/getAllShopsBalance";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { Button } from "@/components/ui/button";
import { labels } from "@/utils/label";
import { ShopsBalanceTable } from "@/components/balance/ShopsBalanceTable";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/formatNumber";
import {
  ShopsBalanceData,
  RawTransactionShopData,
  ShopBalanceDetails,
} from "@/schema/balanceSchema";
import {
  calculateAllShopsBalanceDetailsOnClient,
  calculateTotalBalance,
  calculateTotalOwnerBalance,
  calculateTotalRenterBalance,
  convertToShopsBalanceData,
} from "@/utils/calculateBalanceClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

export default function AllShopsMonthlyBalancePage() {
  const proprietor: boolean = false;
  const BATCH_SIZE = 10;
  const hasStartedLoading = useRef(false);

  const [totalBalance, setTotalBalance] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [error, setError] = useState<any>(null);
  const [accumulatedData, setAccumulatedData] = useState<ShopBalanceDetails[]>(
    []
  );

  const {
    allBalances,
    setAllBalances,
    setAllBalanceDetails,
    exportAllBalanceToExcel,
    exportAllBalanceToPdf,
    setAllBalanceFiltered,
    allBalanceFiltered,
    exportAllBalanceToPDFFiltered,
    exportAllBalanceToExcelFiltered,
  } = useStore(
    useShallow((state) => ({
      allBalances: state.allBalances,
      setAllBalances: state.setAllBalances,
      setAllBalanceDetails: state.setAllBalanceDetails,
      exportAllBalanceToPdf: state.exportAllBalanceToPDF,
      exportAllBalanceToExcel: state.exportAllBalanceToExcel,
      exportAllBalanceToPDFFiltered: state.exportAllBalanceToPDFFiltered,
      exportAllBalanceToExcelFiltered: state.exportAllBalanceToExcelFiltered,
      setAllBalanceFiltered: state.setAllBalanceFiltered,
      allBalanceFiltered: state.allBalanceFiltered,
    }))
  );

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAccumulatedData([]);
      setTotalBalance(0);

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
      // proprietor=false for monthly balances
      const firstCalculated = calculateAllShopsBalanceDetailsOnClient(
        firstBatch,
        proprietor
      );

      setAccumulatedData(firstCalculated);
      let runningTotal = calculateTotalBalance(firstCalculated);
      let runningOwnerTotal = calculateTotalOwnerBalance(firstCalculated);
      let runningRenterTotal = calculateTotalRenterBalance(firstCalculated);
      setTotalBalance(runningTotal);

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
        runningTotal = calculateTotalBalance(accumulated);
        runningOwnerTotal = calculateTotalOwnerBalance(accumulated);
        runningRenterTotal = calculateTotalRenterBalance(accumulated);
        setTotalBalance(runningTotal);

        setLoadingProgress(
          `Loading shops: ${accumulated.length}/${totalCount}`
        );
      }

      // Final update - convert to ShopsBalanceData for store compatibility
      setAllBalances(convertToShopsBalanceData(accumulated));
      setAllBalanceDetails(accumulated);
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

  const handleFilter = (value: string) => {
    if (value === "all") {
      setAllBalanceFiltered(null);
    } else {
      setAllBalanceFiltered(Number(value));
    }
  };

  // Use accumulated data directly for table display (shows all three balance types)
  // Convert for store compatibility
  const convertedAccumulated = convertToShopsBalanceData(accumulatedData);

  const displayData =
    accumulatedData.length > 0 ? accumulatedData : allBalances || [];

  return (
    <div>
      <CardHeader>
        <CardTitle>{labels.allShopsMonthlyBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && loadingProgress && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {loadingProgress}
            </p>
          </div>
        )}
        <div
          className={cn(
            "flex flex-col items-start justify-start",
            "lg:flex-row lg:justify-between lg:items-center",
            "w-full gap-4 flex-wrap"
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-start gap-2">
              <span className="text-sm font-semibold">Total Balance:</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(totalBalance)}
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center justify-start gap-2 mb-4">
            <Select onValueChange={handleFilter} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by balance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="50000000">5.000.000</SelectItem>
                <SelectItem value="100000000">10.000.000</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4" />
                  {labels.download}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{labels.downloadOptions}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportAllBalanceToPdf}>
                  {labels.downloadAsPDF}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAllBalanceToExcel}>
                  {labels.downloadAsExcel}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAllBalanceToPDFFiltered}>
                  {labels.downloadAsPDFFiltered}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAllBalanceToExcelFiltered}>
                  {labels.downloadAsExcelFiltered}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {displayData && displayData.length > 0 ? (
          <ShopsBalanceTable shopsBlances={displayData} />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </div>
  );
}
