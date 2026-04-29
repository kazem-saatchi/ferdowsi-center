import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChargePaymentData } from "@/schema/balanceSchema";
import { labels } from "@/utils/label";
import { Charge, Payment } from "@prisma/client";
import { formatPersianDate } from "@/utils/localeDate";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useState } from "react";
import TransactionInfo from "./TransactionInfo";

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
      type: "charge",
    })),
    ...payments.map((payment) => ({
      ...payment,
      title: payment.title,
      type: "payment",
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
              {labels.transactionInfo}
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
              <TableCell className="text-center">{item.personName}</TableCell>
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
                totalChargeBalance.balance > 0
                  ? "text-red-500"
                  : totalChargeBalance.balance < 0
                    ? "text-green-500"
                    : ""
              }`}
            >
              {totalProprietorBalance.balance.toLocaleString()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <Dialog
        open={selectedTransactionId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTransactionId(null);
        }}
      >
        <DialogContent
          className={cn(
            "flex max-h-[min(90vh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
            "[&>button.absolute]:hidden",
          )}
        >
          <DialogHeader className="space-y-1 border-b bg-muted/40 px-6 py-4 text-right sm:text-right">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {labels.transactionInfo}
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-muted-foreground">
              {labels.viewDetail}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {selectedTransactionId ? (
              <TransactionInfo bankTransactionId={selectedTransactionId} />
            ) : null}
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-3 sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              className="min-w-[7rem]"
              onClick={() => setSelectedTransactionId(null)}
            >
              {labels.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
