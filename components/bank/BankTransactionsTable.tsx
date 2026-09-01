// components/transactions/BankTransactionTable.tsx
"use client"; // This component uses hooks (useQuery) indirectly via its parent

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Adjust import path as needed
import { Badge } from "@/components/ui/badge"; // For displaying type/category
import { TransactionType } from "@prisma/client";
import { format } from "date-fns-jalali"; // For date formatting
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { labels, bankTransactionCategoryLabels } from "@/utils/label";
import type { SerializedBankTransaction } from "@/utils/bankAmount";
import type { BankTransactionSortField } from "@/utils/bankTransactionFilters";
import { formatNumber } from "@/utils/formatNumber";
import { cn } from "@/lib/utils";

interface BankTransactionTableProps {
  // Serialized: amount/balance arrive as numbers, since bigint cannot cross
  // the server-action boundary. See utils/bankAmount.ts.
  transactions: SerializedBankTransaction[];
  isLoading: boolean;
  isError: boolean;
  // Sorting is owned by the page (it drives the query); the table only reports
  // clicks. Optional so the component still renders without it.
  sortBy?: BankTransactionSortField;
  sortOrder?: "asc" | "desc";
  onSort?: (field: BankTransactionSortField) => void;
}

export function BankTransactionTable({
  transactions,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
}: BankTransactionTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border p-4">
        <p>بارگذاری اطلاعات</p>
        {/* You could add Skeleton loaders here for a better UX */}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border p-4 text-red-600">
        <p>خطا در گرفتن اطلاعات</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <p>هیچ تراکنشی پیدا نشد</p>
      </div>
    );
  }

  const SortableHead = ({
    field,
    children,
    className,
  }: {
    field: BankTransactionSortField;
    children: React.ReactNode;
    className?: string;
  }) => {
    if (!onSort) {
      return <TableHead className={className}>{children}</TableHead>;
    }

    const isActive = sortBy === field;
    const Icon = !isActive
      ? ChevronsUpDown
      : sortOrder === "asc"
      ? ArrowUp
      : ArrowDown;

    return (
      <TableHead className={className}>
        <button
          type="button"
          onClick={() => onSort(field)}
          aria-label={`${labels.sortByColumn} ${
            typeof children === "string" ? children : field
          }`}
          className={cn(
            "inline-flex items-center gap-1 hover:text-foreground transition-colors",
            isActive ? "text-foreground font-semibold" : "text-muted-foreground"
          )}
        >
          {children}
          <Icon className="h-3.5 w-3.5 shrink-0" />
        </button>
      </TableHead>
    );
  };

  return (
    // Two more columns than before, so let the table scroll on its own rather
    // than pushing the page sideways.
    <div className="rounded-md border overflow-x-auto">
      <Table dir="rtl">
        <TableCaption>لیست تراکنش های بانک</TableCaption>
        <TableHeader>
          <TableRow>
            <SortableHead field="date" className="w-[120px] text-center">
              {labels.date}
            </SortableHead>
            <TableHead className="text-right">{labels.description}</TableHead>
            <TableHead className="text-center w-[80px]">
              {labels.transactionCategory}
            </TableHead>
            <TableHead className="text-center">{labels.type}</TableHead>
            <TableHead className="text-center">
              {labels.registrationStatus}
            </TableHead>
            <TableHead className="text-center">
              {labels.receiptNumberShort}
            </TableHead>
            <SortableHead field="amount" className="text-left">
              {labels.amount}
            </SortableHead>
            <TableHead className="text-left">{labels.balance}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">
                {format(new Date(tx.date), "yyyy-MM-dd")} {/* Format date */}
              </TableCell>
              <TableCell
                className="max-w-[320px] truncate"
                title={tx.description}
              >
                {tx.description}
              </TableCell>
              <TableCell>
                {tx.category ? (
                  <Badge variant="outline">
                    {/* The enum name itself used to be rendered, in English,
                        in an otherwise Persian table. */}
                    {bankTransactionCategoryLabels[tx.category] ?? tx.category}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {labels.uncategorized}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    tx.type === TransactionType.INCOME ? "default" : "secondary"
                  }
                  className={
                    tx.type === TransactionType.INCOME
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : tx.type === TransactionType.PAYMENT
                      ? "bg-orange-100 text-yellow-800 dark:bg-orange-900 dark:text-yellow-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }
                >
                  {tx.type === "INCOME"
                    ? "درآمد"
                    : tx.type === "PAYMENT"
                    ? "هزینه"
                    : "نامشخص"}
                </Badge>
              </TableCell>
              {/* Whether the row has been turned into a Payment/Cost/Income —
                  the thing you actually need to see when reconciling an import */}
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={
                    tx.registered
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                  }
                >
                  {tx.registered
                    ? labels.registeredOnly
                    : labels.unregisteredOnly}
                </Badge>
              </TableCell>
              <TableCell
                className="text-center text-xs max-w-[160px] truncate"
                title={tx.bankRecieptId ?? undefined}
              >
                {tx.bankRecieptId?.trim() || "—"}
              </TableCell>
              <TableCell
                className={`text-left font-semibold ${
                  tx.type === TransactionType.INCOME
                    ? "text-green-600 dark:text-green-400"
                    : tx.type === TransactionType.PAYMENT
                    ? "text-red-600 dark:text-red-500"
                    : ""
                }`}
              >
                {formatNumber(tx.amount)}
                {tx.type === TransactionType.PAYMENT ? " - " : " + "}
              </TableCell>
              <TableCell className="text-left">
                {formatNumber(tx.balance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
