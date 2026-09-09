"use client";

import { Download } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { formatNumber } from "@/utils/formatNumber";
import { labels } from "@/utils/label";
import type { ShopsBalanceVariant } from "@/utils/shopsBalanceExcel";

/** Debt thresholds the list can be narrowed to, in rials. */
const DEBT_THRESHOLDS = [50_000_000, 100_000_000];

interface ShopsBalanceToolbarProps {
  /** Which report the Excel exports should build. */
  variant: ShopsBalanceVariant;
  /** Sum of every balance on screen, shown beside the controls. */
  totalBalance: number;
  lastBankTransactionDate?: Date | null;
}

/** Summary line, debt filter and download menu shared by the all-shops balance
 *  pages, so the monthly and proprietor views cannot drift apart. */
export function ShopsBalanceToolbar({
  variant,
  totalBalance,
  lastBankTransactionDate,
}: ShopsBalanceToolbarProps) {
  const {
    setAllBalanceFiltered,
    exportAllBalanceToPDF,
    exportAllBalanceToPDFFiltered,
    exportShopsBalanceToExcel,
  } = useStore(
    useShallow((state) => ({
      setAllBalanceFiltered: state.setAllBalanceFiltered,
      exportAllBalanceToPDF: state.exportAllBalanceToPDF,
      exportAllBalanceToPDFFiltered: state.exportAllBalanceToPDFFiltered,
      exportShopsBalanceToExcel: state.exportShopsBalanceToExcel,
    }))
  );

  const handleFilter = (value: string) => {
    setAllBalanceFiltered(value === "all" ? null : Number(value));
  };

  const handleExportExcel = (filtered: boolean) => {
    void exportShopsBalanceToExcel({
      variant,
      lastBankTransactionDate,
      filtered,
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-start",
        "lg:flex-row lg:justify-between lg:items-center",
        "w-full gap-4 flex-wrap"
      )}
    >
      <div className="flex flex-row items-center justify-start gap-2">
        <span className="text-sm font-semibold">{labels.grandTotal}:</span>
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
          {formatNumber(totalBalance)}
        </span>
      </div>
      <div className="flex flex-row items-center justify-start gap-2 mb-4">
        <Select onValueChange={handleFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={labels.filterByDebt} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.allShops}</SelectItem>
            {DEBT_THRESHOLDS.map((threshold) => (
              <SelectItem key={threshold} value={String(threshold)}>
                {`${labels.debtOver} ${formatNumber(threshold)}`}
              </SelectItem>
            ))}
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
            <DropdownMenuItem onClick={exportAllBalanceToPDF}>
              {labels.downloadAsPDF}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportExcel(false)}>
              {labels.downloadAsExcel}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportAllBalanceToPDFFiltered}>
              {labels.downloadAsPDFFiltered}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportExcel(true)}>
              {labels.downloadAsExcelFiltered}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
