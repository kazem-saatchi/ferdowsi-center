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
import { calculateMonthlyShare } from "@/utils/monthlyChargeShare";

interface BalanceTableProps {
  charges: Charge[];
  payments: Payment[];
  plaque?: string | number;
  /** Newest bank statement row in the database — printed on the Excel report so
   *  the reader knows later payments are not reflected yet. */
  lastBankTransactionDate?: Date | null;
  /** Current renter. Monthly charges booked to anyone else fall to the owner. */
  renterId?: string | null;
  ownerName?: string;
  renterName?: string;
}

type TotalBalance = {
  charge: number;
  payment: number;
  balance: number;
};

type TabType = "all" | "proprietor" | "non-proprietor";

const tabs: { id: TabType; label: string }[] = [
  { id: "all", label: labels.all },
  { id: "proprietor", label: labels.proprietorCharge },
  { id: "non-proprietor", label: labels.monthlyCharge },
];

function computeTotals(
  balanceData: Array<{ type: "charge" | "payment"; amount: number; proprietor: boolean }>
): TotalBalance {
  return {
    charge: balanceData
      .filter((item) => item.type === "charge")
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    payment: balanceData
      .filter((item) => item.type === "payment")
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    balance: balanceData.reduce((sum, item) => {
      return item.type === "charge" ? sum + item.amount : sum - item.amount;
    }, 0),
  };
}

export function BalanceDetailTable({
  charges,
  payments,
  plaque,
  lastBankTransactionDate,
  renterId,
  ownerName,
  renterName,
}: BalanceTableProps) {
  const { exportBalanceDetailToExcel } = useStore();
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<BalanceTransactionRow | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // ── filtered source data based on active tab ───────────────────────────────
  const activeCharges =
    activeTab === "all"
      ? charges
      : activeTab === "proprietor"
        ? charges.filter((c) => c.proprietor)
        : charges.filter((c) => !c.proprietor);

  const activePayments =
    activeTab === "all"
      ? payments
      : activeTab === "proprietor"
        ? payments.filter((p) => p.proprietor)
        : payments.filter((p) => !p.proprietor);

  // ── sorted combined rows for the current tab ──────────────────────────────
  const balanceData = [
    ...activeCharges.map((charge) => ({
      ...charge,
      type: "charge" as const,
    })),
    ...activePayments.map((payment) => ({
      ...payment,
      type: "payment" as const,
    })),
  ].sort((a, b) => {
    const dateA = a.date?.getTime() || 0;
    const dateB = b.date?.getTime() || 0;
    return dateB - dateA; // newest first
  });

  // ── running balance per row ───────────────────────────────────────────────
  // Accumulate chronologically (oldest → newest): charges add, payments subtract.
  // Stored by row key so it can be displayed in the newest-first table order.
  const runningBalances = new Map<string, number>();
  let runningBalance = 0;
  for (let i = balanceData.length - 1; i >= 0; i--) {
    const item = balanceData[i];
    runningBalance += item.type === "charge" ? item.amount : -item.amount;
    runningBalances.set(`${item.type}-${item.id}`, runningBalance);
  }

  // ── footer totals ─────────────────────────────────────────────────────────
  // "all" tab keeps the original two-row footer (non-prop / prop split)
  const totalNonProprietorBalance = computeTotals(
    balanceData.filter((item) => !item.proprietor)
  );
  const totalProprietorBalance = computeTotals(
    balanceData.filter((item) => item.proprietor)
  );
  // filtered tabs show a single total row
  const totalActiveBalance = computeTotals(balanceData);

  // ── monthly charge split ──────────────────────────────────────────────────
  // Always computed over the full ledger, so the figure does not shift with the
  // active tab. Only meaningful while monthly rows are on screen.
  const monthlyShare = calculateMonthlyShare(charges, payments, renterId);
  const showMonthlyShare = !!renterId && activeTab !== "proprietor";

  // ── export ────────────────────────────────────────────────────────────────
  const tabSuffix =
    activeTab === "proprietor"
      ? "Proprietor"
      : activeTab === "non-proprietor"
        ? "NonProprietor"
        : "All";

  const plaquePart = plaque != null ? `-Shop${plaque}` : "";
  const fileName = `Balance-Detail${plaquePart}-${tabSuffix}-Report`;

  const footerLabel =
    activeTab === "proprietor"
      ? labels.totalProprietorBalance
      : labels.totalChargeBalance;

  const handleExportExcel = () => {
    // The "all" report splits into monthly + proprietor sections itself, so it
    // receives the unfiltered ledger.
    void exportBalanceDetailToExcel({
      charges: activeCharges,
      payments: activePayments,
      variant: activeTab,
      plaque,
      lastBankTransactionDate,
      renterId,
      ownerName,
      renterName,
      fileName,
    });
  };

  // ── balance colour helper ─────────────────────────────────────────────────
  const balanceColour = (balance: number) =>
    balance > 0 ? "text-red-500" : balance < 0 ? "text-green-500" : "";

  return (
    <div className="space-y-4">
      {/* ── Tabs ── */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Monthly charge split between renter and owner ── */}
      {showMonthlyShare && (
        <div className="rounded-md border p-3 space-y-2">
          <p className="text-sm font-medium">{labels.monthlyShareTitle}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                {labels.renterShareOfMonthly}
                {renterName ? ` — ${renterName}` : ""}
              </span>
              <span
                className={cn("font-bold", balanceColour(monthlyShare.renter))}
              >
                {monthlyShare.renter.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                {labels.ownerShareOfMonthly}
                {ownerName ? ` — ${ownerName}` : ""}
              </span>
              <span
                className={cn("font-bold", balanceColour(monthlyShare.owner))}
              >
                {monthlyShare.owner.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {labels.exRenterShareNote}
          </p>
        </div>
      )}

      {/* ── Export button ── */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={handleExportExcel}
          size="sm"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export Excel
        </Button>
      </div>

      {/* ── Table ── */}
      <Table className="border rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">{labels.type}</TableHead>
            <TableHead className="text-center">{labels.title}</TableHead>
            <TableHead className="text-center">{labels.name}</TableHead>
            <TableHead className="text-center">{labels.date}</TableHead>
            <TableHead className="text-center">{labels.amount}</TableHead>
            <TableHead className="text-center">
              {labels.balanceAfterTransaction}
            </TableHead>
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
                item.type === "charge" ? "bg-red-700/30" : "bg-green-700/30"
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
              <TableCell
                className={cn(
                  "text-center font-medium",
                  balanceColour(runningBalances.get(`${item.type}-${item.id}`) ?? 0)
                )}
              >
                {(runningBalances.get(`${item.type}-${item.id}`) ?? 0).toLocaleString()}
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
          {activeTab === "all" ? (
            // "All" tab: show the original two-row split footer
            <>
              <TableRow>
                <TableCell
                  className="text-center font-medium border-2"
                  colSpan={4}
                >
                  {labels.totalChargeBalance}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-center font-bold border-2",
                    balanceColour(totalNonProprietorBalance.balance)
                  )}
                >
                  {totalNonProprietorBalance.balance.toLocaleString()}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
              <TableRow>
                <TableCell
                  className="text-center font-medium border-2"
                  colSpan={4}
                >
                  {labels.totalProprietorBalance}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-center font-bold border-2",
                    balanceColour(totalProprietorBalance.balance)
                  )}
                >
                  {totalProprietorBalance.balance.toLocaleString()}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </>
          ) : (
            // Filtered tabs: single total row
            <TableRow>
              <TableCell
                className="text-center font-medium border-2"
                colSpan={5}
              >
                {footerLabel}
              </TableCell>
              <TableCell
                className={cn(
                  "text-center font-bold border-2",
                  balanceColour(totalActiveBalance.balance)
                )}
              >
                {totalActiveBalance.balance.toLocaleString()}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          )}
        </TableFooter>
      </Table>

      <TransactionInfoDialog
        selectedTransactionId={selectedTransactionId}
        setSelectedTransactionId={setSelectedTransactionId}
      />
      <ChangeUserDialog
        selectedTransaction={selectedTransaction}
        setSelectedTransaction={setSelectedTransaction}
      />
    </div>
  );
}
