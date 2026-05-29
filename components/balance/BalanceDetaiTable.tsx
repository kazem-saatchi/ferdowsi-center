"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { labels } from "@/utils/label";
import { Charge, Payment } from "@prisma/client";
import { formatPersianDate } from "@/utils/localeDate";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";

import { Download } from "lucide-react";
import { useState } from "react";
import TransactionInfoDialog from "./TransactionInfoDialog";
import ChangeUserDialog from "./ChangeUserDialog";
import type { BalanceTransactionRow } from "./ChangeUser";

interface BalanceTableProps {
  charges: Charge[];
  payments: Payment[];
}

// type BalanceItem = {
//   type: string;
//   id: string;
//   title: string;
//   amount: number;
//   date: Date;
//   proprietor: boolean;
// };

type TotalBalance = {
  charge: number;
  payment: number;
  balance: number;
};

export function BalanceDetailTable({ charges, payments }: BalanceTableProps) {
  const { exportBalanceDetailToPDF, exportBalanceDetailToExcel } = useStore();
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<BalanceTransactionRow | null>(null);

  const handleExportPDF = () => {
    exportBalanceDetailToPDF(charges, payments);
  };

  const handleExportExcel = () => {
    exportBalanceDetailToExcel(charges, payments);
  };

  const balanceData = [
    ...charges.map((charge) => ({
      ...charge,
      title: charge.title,
      type: "charge" as const,
    })),
    ...payments.map((payment) => ({
      ...payment,
      title: payment.title,
      type: "payment" as const,
    })),
  ].sort((a, b) => {
    const dateA = a.date?.getTime() || 0;
    const dateB = b.date?.getTime() || 0;
    return dateB - dateA; // newest first
  });

  // Calculate totals for better organization
  const totalChargeBalance: TotalBalance = {
    charge: balanceData
      .filter((item) => item.type === "charge")
      .filter((item) => !item.proprietor)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    payment: balanceData
      .filter((item) => item.type === "payment")
      .filter((item) => !item.proprietor)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    balance: balanceData
      .filter((item) => !item.proprietor)
      .reduce((sum, item) => {
        return item.type === "charge" ? sum + item.amount : sum - item.amount;
      }, 0),
  };

  const totalProprietorBalance: TotalBalance = {
    charge: balanceData
      .filter((item) => item.type === "charge")
      .filter((item) => item.proprietor)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    payment: balanceData
      .filter((item) => item.type === "payment")
      .filter((item) => item.proprietor)
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    balance: balanceData
      .filter((item) => item.proprietor)
      .reduce((sum, item) => {
        return item.type === "charge" ? sum + item.amount : sum - item.amount;
      }, 0),
  };

  return (
    <div className="space-y-4">
      {/* Export buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={handleExportPDF}
          size="sm"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export PDF
        </Button>
        <Button
          onClick={handleExportExcel}
          size="sm"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export Excel
        </Button>
      </div>

      <Table className="border rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">{labels.type}</TableHead>
            <TableHead className="text-center">{labels.title}</TableHead>
            <TableHead className="text-center">{labels.name}</TableHead>
            <TableHead className="text-center">{labels.date}</TableHead>
            <TableHead className="text-center">{labels.amount}</TableHead>
            <TableHead className="text-center">
              {labels.bankTransactionId}
            </TableHead>
            <TableHead className="text-center">
              {labels.description}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {balanceData.map((item) => (
            <TableRow
              key={`${item.type}-${item.id}`}
              className={cn(
                item.type === "charge" ? "bg-red-700/30" : "bg-green-700/30",
              )}
            >
              <TableCell className="text-center capitalize">
                {item.type === "charge" ? labels.charge : labels.payment}
              </TableCell>
              <TableCell className="text-center">{item.title}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTransactionId(null);
                    setSelectedTransaction(item as BalanceTransactionRow);
                  }}
                >
                  {item.personName}
                </Button>
              </TableCell>
              <TableCell className="text-center">
                {formatPersianDate(item.date)}
              </TableCell>
              <TableCell className="text-center">
                {item.amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">
                {item.bankTransactionId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTransaction(null);
                      setSelectedTransactionId(item.bankTransactionId);
                    }}
                  >
                    {labels.view}
                  </Button>
                )}
              </TableCell>
              <TableCell className="text-center">{item.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell className="text-center font-medium border-2" colSpan={4}>
              {labels.totalChargeBalance}
            </TableCell>
            <TableCell
              className={`text-center font-bold border-2 ${
                totalChargeBalance.balance > 0
                  ? "text-red-500"
                  : totalChargeBalance.balance < 0
                    ? "text-green-500"
                    : ""
              }`}
            >
              {totalChargeBalance.balance.toLocaleString()}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-center font-medium border-2" colSpan={4}>
              {labels.totalProprietorBalance}
            </TableCell>
            <TableCell
              className={`text-center font-bold border-2 ${
                totalProprietorBalance.balance > 0
                  ? "text-red-500"
                  : totalProprietorBalance.balance < 0
                    ? "text-green-500"
                    : ""
              }`}
            >
              {totalProprietorBalance.balance.toLocaleString()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <TransactionInfoDialog
        selectedTransactionId={selectedTransactionId}
        setSelectedTransactionId={setSelectedTransactionId}
      />
      <ChangeUserDialog selectedTransaction={selectedTransaction} setSelectedTransaction={setSelectedTransaction} />
    </div>
  );
}
