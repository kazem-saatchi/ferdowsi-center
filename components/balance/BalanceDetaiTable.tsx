"use client";

import { formatNumber } from "@/utils/formatNumber";
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
import BalanceAmount from "./BalanceAmount";
import { Charge, Payment } from "@prisma/client";
import { formatJalaliDate } from "@/utils/localeDate";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Download } from "lucide-react";
import { useState } from "react";
import TransactionInfoDialog from "./TransactionInfoDialog";
import ChangeUserDialog from "./ChangeUserDialog";
import type { BalanceTransactionRow } from "./ChangeUser";
import { calculateMonthlyShare } from "@/utils/monthlyChargeShare";
import { WriteOnly } from "@/components/auth/WriteAccess";

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
  balanceData: Array<{ rowKind: "charge" | "payment"; amount: number; proprietor: boolean }>
): TotalBalance {
  return {
    charge: balanceData
      .filter((item) => item.rowKind === "charge")
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    payment: balanceData
      .filter((item) => item.rowKind === "payment")
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    balance: balanceData.reduce((sum, item) => {
      return item.rowKind === "charge" ? sum + item.amount : sum - item.amount;
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
      rowKind: "charge" as const,
    })),
    ...activePayments.map((payment) => ({
      ...payment,
      rowKind: "payment" as const,
    })),
  ].sort((a, b) => {
    const dateA = a.date?.getTime() || 0;
    const dateB = b.date?.getTime() || 0;
    return dateA - dateB; // oldest first, like a bank statement
  });

  // ── running balance per row ───────────────────────────────────────────────
  // Rows are already chronological, so the balance accumulates straight down the
  // table: charges add, payments subtract.
  const runningBalances = new Map<string, number>();
  let runningBalance = 0;
  for (const item of balanceData) {
    runningBalance += item.rowKind === "charge" ? item.amount : -item.amount;
    runningBalances.set(`${item.rowKind}-${item.id}`, runningBalance);
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
              <BalanceAmount
                value={monthlyShare.renter}
                debtSign="positive"
                className="font-bold"
              />
            </div>
            <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                {labels.ownerShareOfMonthly}
                {ownerName ? ` — ${ownerName}` : ""}
              </span>
              <BalanceAmount
                value={monthlyShare.owner}
                debtSign="positive"
                className="font-bold"
              />
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
          {labels.download}
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
            <TableHead className="text-center">{labels.edit}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {balanceData.map((item) => (
            <TableRow key={`${item.rowKind}-${item.id}`}>
              {/* A thin bar on the row's leading edge plus a soft label mark
                  the kind, so the rows themselves stay neutral. */}
              <TableCell
                className={cn(
                  "text-center border-s-4",
                  item.rowKind === "charge"
                    ? "border-s-red-500"
                    : "border-s-emerald-500"
                )}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "whitespace-nowrap font-medium",
                    item.rowKind === "charge"
                      ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  )}
                >
                  {item.rowKind === "charge" ? labels.charge : labels.payment}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{item.title}</TableCell>
              <TableCell className="text-center">{item.personName}</TableCell>
              <TableCell className="text-center">
                {formatJalaliDate(item.date)}
              </TableCell>
              <TableCell className="text-center">
                {formatNumber(item.amount)}
              </TableCell>
              <TableCell
                className="text-center font-medium"
              >
                <BalanceAmount
                  value={runningBalances.get(`${item.rowKind}-${item.id}`) ?? 0}
                  debtSign="positive"
                />
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
              <TableCell className="text-center">
                <WriteOnly>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTransactionId(null);
                      setSelectedTransaction(item as BalanceTransactionRow);
                    }}
                  >
                    {labels.edit}
                  </Button>
                </WriteOnly>
              </TableCell>
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
                  className="text-center font-bold border-2"
                >
                  <BalanceAmount value={totalNonProprietorBalance.balance} debtSign="positive" />
                </TableCell>
                <TableCell colSpan={3} />
              </TableRow>
              <TableRow>
                <TableCell
                  className="text-center font-medium border-2"
                  colSpan={4}
                >
                  {labels.totalProprietorBalance}
                </TableCell>
                <TableCell
                  className="text-center font-bold border-2"
                >
                  <BalanceAmount value={totalProprietorBalance.balance} debtSign="positive" />
                </TableCell>
                <TableCell colSpan={3} />
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
                className="text-center font-bold border-2"
              >
                <BalanceAmount value={totalActiveBalance.balance} debtSign="positive" />
              </TableCell>
              <TableCell colSpan={3} />
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
