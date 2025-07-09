"use client";

import { useEffect, useState } from "react";
import { useGetAllShopsBalance } from "@/tanstack/query/balanceQuery";
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

  const [totalBalance, setTotalBalance] = useState<number>(0);

  const { data, isLoading, isError, error, refetch } =
    useGetAllShopsBalance(proprietor);
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

  const handleFilter = (value: string) => {
    if (value === "all") {
      setAllBalanceFiltered(null);
    } else {
      setAllBalanceFiltered(Number(value));
    }
  };

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
                <Button className="flex items-center gap-2">
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
        {allBalances && allBalances.length > 0 ? (
          <ShopsBalanceTable
            shopsBlances={
              allBalanceFiltered && allBalanceFiltered.length > 0
                ? allBalanceFiltered
                : allBalances
            }
          />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </div>
  );
}
