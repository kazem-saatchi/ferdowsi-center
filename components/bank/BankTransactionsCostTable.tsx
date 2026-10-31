// components/transactions/BankTransactionTable.tsx
"use client"; // This component uses hooks (useQuery) indirectly via its parent
import LoadingComponent from "@/components/LoadingComponent";
import EmptyState from "@/components/EmptyState";
import { formatJalaliDate } from "@/utils/localeDate";

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
import { bankTransactionCategoryLabels, labels } from "@/utils/label";
import type { SerializedBankTransaction } from "@/utils/bankAmount";
import { formatNumber } from "@/utils/formatNumber";
import { Button } from "../ui/button";
import { Fragment, useState } from "react";
import CostFromBankForm from "./CostFromBankForm";
import { WriteOnly } from "@/components/auth/WriteAccess";

const getCategoryText = (category: TransactionCategory | null) => {
  if (!category) return labels.noValue;
  return bankTransactionCategoryLabels[category] ?? category;
};

interface BankTransactionTableProps {
  // Serialized: amount/balance arrive as numbers, since bigint cannot cross
  // the server-action boundary. See utils/bankAmount.ts.
  transactions: SerializedBankTransaction[];
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
    return <LoadingComponent inline />;
  }

  // The page shows the error itself, with the server's message.
  if (isError) {
    return null;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-md border">
        <EmptyState />
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
            <TableHead className="text-start">{labels.description}</TableHead>
            <TableHead className="text-center w-[80px]">
              {labels.transactionCategory}
            </TableHead>
            <TableHead className="text-center">{labels.amount}</TableHead>
            <TableHead className="text-end"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <Fragment key={tx.id}>
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {formatJalaliDate(tx.date)}
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
                <TableCell className="text-end">
                  <WriteOnly>
                    <Button
                      onClick={() => {
                        setEditRowId(tx.id);
                      }}
                      variant="outline"
                    >
                      {labels.applyCost}
                    </Button>
                  </WriteOnly>
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
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
