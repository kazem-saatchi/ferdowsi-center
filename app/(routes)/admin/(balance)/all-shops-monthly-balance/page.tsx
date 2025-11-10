"use client";

import { useEffect, useState, useCallback } from "react";
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
import { ShopsBalanceData } from "@/schema/balanceSchema";
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
  const CHUNK_SIZE = 10;

  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isLoadingChunks, setIsLoadingChunks] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [error, setError] = useState<any>(null);
  const [accumulatedData, setAccumulatedData] = useState<ShopsBalanceData[]>(
    []
  );

  const {
    allBalances,
    setAllBalances,
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
      exportAllBalanceToPdf: state.exportAllBalanceToPDF,
      exportAllBalanceToExcel: state.exportAllBalanceToExcel,
      exportAllBalanceToPDFFiltered: state.exportAllBalanceToPDFFiltered,
      exportAllBalanceToExcelFiltered: state.exportAllBalanceToExcelFiltered,
      setAllBalanceFiltered: state.setAllBalanceFiltered,
      allBalanceFiltered: state.allBalanceFiltered,
    }))
  );

  const loadAllChunks = useCallback(async () => {
    try {
      setIsLoadingChunks(true);
      setError(null);
      setAccumulatedData([]);
      setTotalBalance(0);

      // First request to get total count
      const firstResponse = await findBalanceAllShops(
        proprietor,
        0,
        CHUNK_SIZE
      );

      if (!firstResponse.success || !firstResponse.data) {
        throw new Error(firstResponse.message || "Failed to load balance data");
      }

      const totalCount = firstResponse.data.totalCount || 0;
      const firstChunk = firstResponse.data.shopsBalance || [];

      // Update with first chunk
      setAccumulatedData(firstChunk);
      const firstTotal = firstChunk.reduce(
        (sum, item) => sum + item.balance,
        0
      );
      setTotalBalance(firstTotal);
      setLoadingProgress(`Loading shops: ${firstChunk.length}/${totalCount}`);

      // Load remaining chunks
      const accumulated: ShopsBalanceData[] = [...firstChunk];

      for (let skip = CHUNK_SIZE; skip < totalCount; skip += CHUNK_SIZE) {
        setLoadingProgress(`Loading shops: ${skip}/${totalCount}`);

        const response = await findBalanceAllShops(
          proprietor,
          skip,
          CHUNK_SIZE
        );

        if (!response.success || !response.data?.shopsBalance) {
          throw new Error(response.message || "Failed to load chunk");
        }

        const chunk = response.data.shopsBalance;
        accumulated.push(...chunk);

        // Update incrementally
        setAccumulatedData([...accumulated]);
        const runningTotal = accumulated.reduce(
          (sum, item) => sum + item.balance,
          0
        );
        setTotalBalance(runningTotal);
        setLoadingProgress(
          `Loading shops: ${accumulated.length}/${totalCount}`
        );
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

  const handleFilter = (value: string) => {
    if (value === "all") {
      setAllBalanceFiltered(null);
    } else {
      setAllBalanceFiltered(Number(value));
    }
  };

  const displayData =
    allBalanceFiltered && allBalanceFiltered.length > 0
      ? allBalanceFiltered
      : accumulatedData.length > 0
      ? accumulatedData
      : allBalances;

  return (
    <div>
      <CardHeader>
        <CardTitle>{labels.allShopsMonthlyBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingChunks && loadingProgress && (
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
            "w-full gap-2"
          )}
        >
          <div className="flex flex-row items-center justify-start gap-2">
            {labels.totalBalance}
            {"  : "}
            <span className="text-xl font-bold">
              {formatNumber(totalBalance)}
            </span>
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
                  disabled={isLoadingChunks}
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
