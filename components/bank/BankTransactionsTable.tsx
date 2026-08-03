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
import type { SerializedBankTransaction } from "@/utils/bankAmount";
import { formatNumber } from "@/utils/formatNumber";

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
  // Serialized: amount/balance arrive as numbers, since bigint cannot cross
  // the server-action boundary. See utils/bankAmount.ts.
  transactions: SerializedBankTransaction[];
  isLoading: boolean;
  isError: boolean;
}

export function BankTransactionTable({
  transactions,
  isLoading,
  isError,
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
            <TableHead className="text-center">{labels.type}</TableHead>
            <TableHead className="text-left">{labels.amount}</TableHead>
            <TableHead className="text-left">{labels.balance}</TableHead>
            {/* Add other relevant columns if needed:
            <TableHead>Reference</TableHead>
            <TableHead>Bank Ref ID</TableHead>
            */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
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
                  <span className="text-xs text-muted-foreground">نامشخص</span>
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
              {/* Add other relevant cells if needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
