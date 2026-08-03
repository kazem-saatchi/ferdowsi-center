"use client";

import { useEffect } from "react";
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
import { useGetAllShopsBalance } from "@/tanstack/query/balanceQuery";
import { convertToShopsBalanceData } from "@/utils/calculateBalanceClient";
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
    setAllBalanceFiltered,
    exportAllBalanceToPDFFiltered,
    exportAllBalanceToExcelFiltered,
  } = useStore(
    useShallow((state) => ({
      setAllBalances: state.setAllBalances,
      setAllBalanceDetails: state.setAllBalanceDetails,
      exportAllBalanceToPdf: state.exportAllBalanceToPDF,
      exportAllBalanceToExcel: state.exportAllBalanceToExcel,
      exportAllBalanceToPDFFiltered: state.exportAllBalanceToPDFFiltered,
      exportAllBalanceToExcelFiltered: state.exportAllBalanceToExcelFiltered,
      setAllBalanceFiltered: state.setAllBalanceFiltered,
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

  const handleFilter = (value: string) => {
    setAllBalanceFiltered(value === "all" ? null : Number(value));
  };

  const totalBalance = (shopsData ?? []).reduce(
    (sum, shop) => sum + shop.totalBalance,
    0
  );

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
                <SelectItem value="50000000">50.000.000</SelectItem>
                <SelectItem value="100000000">100.000.000</SelectItem>
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
        {shopsData && shopsData.length > 0 ? (
          <ShopsBalanceTable shopsBlances={shopsData} />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </div>
  );
}
