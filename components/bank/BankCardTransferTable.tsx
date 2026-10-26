// components/transactions/BankTransactionTable.tsx
"use client"; // This component uses hooks (useQuery) indirectly via its parent
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
import { BankTransaction } from "@prisma/client";
import { labels } from "@/utils/label";
import type { SerializedBankTransaction } from "@/utils/bankAmount";
import { formatNumber } from "@/utils/formatNumber";
import LtrDigits from "../LtrDigits";
import AddPaymentButton from "../payment/AddPaymentButton";
import { useState } from "react";
import { Button } from "../ui/button";
import PaymentFromBankForm from "./PaymentFromBankForm";

interface BankTransactionTableProps {
  // Serialized: amount/balance arrive as numbers, since bigint cannot cross
  // the server-action boundary. See utils/bankAmount.ts.
  transactions: SerializedBankTransaction[];
  isLoading: boolean;
  isError: boolean;
}

export function BankCardTransferTable({
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
            <TableHead className="text-center">حذف از لیست</TableHead>

            {/* Add other relevant columns if needed:
            <TableHead>Bank Ref ID</TableHead>
            */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <>
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {formatJalaliDate(tx.date)}
                </TableCell>
                <TableCell className="text-justify max-w-[300px]">
                  {tx.description}
                </TableCell>

                <TableCell className="text-center">
                  <LtrDigits value={tx.senderAccount} />
                </TableCell>
                <TableCell className="text-center">
                  <LtrDigits value={tx.recieverAccount} />
                </TableCell>
                <TableCell className="text-center">
                  {formatNumber(tx.amount)}
                </TableCell>
                <TableCell className="text-center">
                  <AddPaymentButton id={tx.id} />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    onClick={() => {
                      setEditRowId(tx.id);
                    }}
                    variant="outline"
                  >
                    ثبت دستی
                  </Button>
                </TableCell>
              </TableRow>
              {editRowId !== null && editRowId === tx.id && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7}>
                    <PaymentFromBankForm
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
