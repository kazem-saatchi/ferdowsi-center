"use client";

import React from "react";
import Link from "next/link";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { Building2, Download, Receipt, Scale, Wallet } from "lucide-react";
import type {
  LedgerTotals,
  PersonBalanceSummary,
  PersonUnitBalance,
} from "@/app/api/actions/balance/getPersonBalance";
import { formatNumber, toPersianDigits } from "@/utils/formatNumber";
import { labels } from "@/utils/label";
import { shopTypeLabel } from "@/utils/shopType";
import {
  exportPersonBalanceToExcel,
  LEDGER_SECTIONS,
  roleOf,
  sectionUnits,
} from "@/utils/personBalanceExcel";
import { cn } from "@/lib/utils";
import type { SafePerson } from "@/schema/personSchema";

/** Columns in the units table, for the full-width section rows. */
const COLUMN_COUNT = 9;

interface PersonBalanceDisplayProps {
  person: SafePerson;
  summary: PersonBalanceSummary;
  units: PersonUnitBalance[];
}

/** Everything is passed in rather than read from the store: the balance slices
 *  are shared with the shop-scoped pages, which fill them with a single unit's
 *  people, and this page used to render those leftovers as if they were the
 *  person's own units. */
export function PersonBalanceDisplay({
  person,
  summary,
  units,
}: PersonBalanceDisplayProps) {
  const handleExport = () => {
    void exportPersonBalanceToExcel({ person, units, summary });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {person.firstName} {person.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {labels.idNumber}: {toPersianDigits(person.IdNumber)} — {labels.primaryPhone}:{" "}
            {toPersianDigits(person.phoneOne)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={units.length === 0}
        >
          <Download className="me-2 h-4 w-4" />
          {labels.downloadAsExcel}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={labels.personNetBalance}
          value={formatNumber(Math.abs(summary.balance))}
          hint={statusHint(summary.balance)}
          icon={Scale}
          emphasis={summary.balance > 0 ? "warning" : "default"}
        />
        <StatCard
          title={labels.personTotalCharge}
          value={formatNumber(summary.totalCharge)}
          icon={Receipt}
        />
        <StatCard
          title={labels.personTotalPayment}
          value={formatNumber(summary.totalPayment)}
          icon={Wallet}
        />
        <StatCard
          title={labels.personUnitsHeld}
          value={formatNumber(summary.unitCount)}
          hint={`${formatNumber(summary.debtUnitCount)} ${labels.personDebtUnits}`}
          icon={Building2}
        />
      </div>

      <div>
        <CardHeader className="px-0 pb-3">
          <CardTitle>{labels.personUnitsTitle}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {labels.personUnitsHint}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {units.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              {labels.personNoUnits}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">
                    {labels.rowNumber}
                  </TableHead>
                  <TableHead className="text-center">{labels.plaque}</TableHead>
                  <TableHead className="text-center">{labels.type}</TableHead>
                  <TableHead className="text-center">
                    {labels.personRole}
                  </TableHead>
                  <TableHead className="text-center">
                    {labels.unitTotalCharge}
                  </TableHead>
                  <TableHead className="text-center">
                    {labels.unitTotalPayment}
                  </TableHead>
                  <TableHead className="text-center">
                    {labels.personNetBalance}
                  </TableHead>
                  <TableHead className="text-center">{labels.status}</TableHead>
                  <TableHead className="text-center" />
                </TableRow>
              </TableHeader>
              {LEDGER_SECTIONS.map((section) => (
                <LedgerSection
                  key={section.key}
                  title={section.title}
                  totalLabel={section.totalLabel}
                  units={sectionUnits(units, section.key)}
                  pick={(unit) => unit[section.key]}
                  total={summary[section.key]}
                />
              ))}
              <TableFooter>
                <TotalRow
                  label={labels.totalBalance}
                  totals={{
                    charge: summary.totalCharge,
                    payment: summary.totalPayment,
                    balance: summary.balance,
                  }}
                />
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </div>
    </div>
  );
}

/** One block of the units table: a title row, one row per unit with activity in
 *  this ledger, and the ledger's subtotal. Row numbers restart in each block. */
function LedgerSection({
  title,
  totalLabel,
  units,
  pick,
  total,
}: {
  title: string;
  totalLabel: string;
  units: PersonUnitBalance[];
  pick: (unit: PersonUnitBalance) => LedgerTotals;
  total: LedgerTotals;
}) {
  return (
    <TableBody>
      <TableRow className="bg-muted/60 hover:bg-muted/60">
        <TableCell colSpan={COLUMN_COUNT} className="text-center font-bold">
          {title}
        </TableCell>
      </TableRow>
      {units.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={COLUMN_COUNT}
            className="text-center text-muted-foreground"
          >
            {labels.noTransactionsInSection}
          </TableCell>
        </TableRow>
      ) : (
        units.map((unit, index) => {
          const figures = pick(unit);
          return (
            <TableRow key={unit.shopId}>
              <TableCell className="text-center">
                {formatNumber(index + 1)}
              </TableCell>
              <TableCell className="text-center font-medium">
                {formatNumber(unit.plaque)}
              </TableCell>
              <TableCell className="text-center">
                {shopTypeLabel(unit.type)}
              </TableCell>
              <TableCell className="text-center">{roleOf(unit)}</TableCell>
              <TableCell className="text-center">
                {formatNumber(figures.charge)}
              </TableCell>
              <TableCell className="text-center">
                {formatNumber(figures.payment)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-center font-semibold",
                  toneOf(figures.balance)
                )}
              >
                {formatNumber(Math.abs(figures.balance))}
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge balance={figures.balance} />
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/shop-balance-detail/${unit.shopId}`}>
                    {labels.viewShopLedger}
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })
      )}
      <TotalRow label={totalLabel} totals={total} subtle />
    </TableBody>
  );
}

function TotalRow({
  label,
  totals,
  subtle = false,
}: {
  label: string;
  totals: LedgerTotals;
  subtle?: boolean;
}) {
  return (
    <TableRow className={cn(subtle && "bg-muted/30 hover:bg-muted/30")}>
      <TableCell colSpan={4} className="text-center font-bold">
        {label}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatNumber(totals.charge)}
      </TableCell>
      <TableCell className="text-center font-bold">
        {formatNumber(totals.payment)}
      </TableCell>
      <TableCell
        className={cn("text-center font-bold", toneOf(totals.balance))}
      >
        {formatNumber(Math.abs(totals.balance))}
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge balance={totals.balance} />
      </TableCell>
      <TableCell />
    </TableRow>
  );
}

/** Balances on this page are charge − payment, so a positive figure is a debt —
 *  the opposite sign convention to the all-shops lists. */
function toneOf(balance: number): string {
  if (balance > 0) return "text-red-600 dark:text-red-400";
  if (balance < 0) return "text-green-600 dark:text-green-400";
  return "";
}

function statusHint(balance: number): string {
  if (balance > 0) return labels.statusDebtor;
  if (balance < 0) return labels.statusCreditor;
  return labels.statusSettled;
}

function StatusBadge({ balance }: { balance: number }) {
  if (balance === 0) {
    return <Badge variant="secondary">{labels.statusSettled}</Badge>;
  }
  return (
    <Badge variant={balance > 0 ? "destructive" : "default"}>
      {balance > 0 ? labels.statusDebtor : labels.statusCreditor}
    </Badge>
  );
}
