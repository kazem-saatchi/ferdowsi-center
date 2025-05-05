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
import { BankTransaction, TransactionCategory } from "@prisma/client";
import { format } from "date-fns-jalali"; // For date formatting
import { labels } from "@/utils/label";
import { formatNumber } from "@/utils/formatNumber";
import AddPaymentButton from "../payment/AddPaymentButton";

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

export function BankCardTransferTable({
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
        <TableCaption>لیست کارت به کارت های بانک</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] text-center">
              {labels.date}
            </TableHead>
            <TableHead className="text-center max-w-[240px]">
              {labels.description}
            </TableHead>

            <TableHead className="text-center">
              {labels.senderCardNumber}
            </TableHead>
            <TableHead className="text-center">
              {labels.receiverCardNumber}
            </TableHead>
            <TableHead className="text-center">{labels.amount}</TableHead>
            <TableHead className="text-center">ثبت</TableHead>

            {/* Add other relevant columns if needed:
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
              <TableCell className="text-justify max-w-[300px]">
                {tx.description}
              </TableCell>

              <TableCell className="text-center">{tx.senderAccount}</TableCell>
              <TableCell className="text-center">
                {tx.recieverAccount}
              </TableCell>
              <TableCell className="text-center">
                {formatNumber(tx.amount)}
              </TableCell>
              <TableCell className="text-center">
                <AddPaymentButton id={tx.id} />
              </TableCell>

              {/* Add other relevant cells if needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
