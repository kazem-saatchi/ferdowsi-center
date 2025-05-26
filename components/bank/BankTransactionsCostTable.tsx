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
import {
  BankTransaction,
  TransactionType,
  TransactionCategory,
} from "@prisma/client";
import { format } from "date-fns-jalali"; // For date formatting
import { labels } from "@/utils/label";
import { formatNumber } from "@/utils/formatNumber";
import { Button } from "../ui/button";
import { useState } from "react";
import CostFromBankForm from "./CostFromBankForm";

// Helper function for currency formatting
const formatCurrency = (amount: number) => {
  // Assuming amount is in the smallest unit (like cents or rials)
  // Adjust the divisor and locale as needed for your currency
  return new Intl.NumberFormat("fa", {
    style: "currency",
    currency: "IRR", // Change to your currency (e.g., 'IRR')
    minimumFractionDigits: 0, // Adjust if you store fractional units
  }).format(amount / 100); // Divide by 100 if amount is in cents/rials
};

// Helper to get display text for enums (optional, but good for readability)
const getCategoryText = (category: TransactionCategory | null) => {
  if (!category) return "N/A";
  // Simple mapping, you might want a more robust solution
  return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

interface BankTransactionTableProps {
  transactions: BankTransaction[];
  isLoading: boolean;
  isError: boolean;
}

export function BankTransactionCostTable({
  transactions,
  isLoading,
  isError,
}: BankTransactionTableProps) {
  const [editRowId, setEditRowId] = useState<string | null>(null);

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

  return (
    <div className="rounded-md border">
      {" "}
      {/* Added border and rounding */}
      <Table dir="rtl">
        <TableCaption>لیست تراکنش های بانک</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] text-center">
              {labels.date}
            </TableHead>
            <TableHead className="text-right">{labels.description}</TableHead>
            <TableHead className="text-center w-[80px]">
              {labels.transactionCategory}
            </TableHead>
            <TableHead className="text-center">{labels.amount}</TableHead>
            <TableHead className="text-left"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <>
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {format(new Date(tx.date), "yyyy-MM-dd")} {/* Format date */}
                </TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell>
                  {tx.category ? (
                    <Badge variant="outline">
                      {getCategoryText(tx.category)}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      نامشخص
                    </span>
                  )}
                </TableCell>

                <TableCell
                  className={`text-center font-semibold ${
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
                  <Button
                    onClick={() => {
                      setEditRowId(tx.id);
                    }}
                    variant="outline"
                  >
                    {labels.applyCost}
                  </Button>
                </TableCell>
              </TableRow>
              {editRowId !== null && editRowId === tx.id && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5}>
                    <CostFromBankForm
                    amount={tx.amount}
                    bankTransactionId={tx.id}
                    date={tx.date}
                    description={tx.description}
                    cancelFn={setEditRowId}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
