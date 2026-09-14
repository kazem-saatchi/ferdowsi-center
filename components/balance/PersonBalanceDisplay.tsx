"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  PersonBalanceSummary,
  PersonUnitBalance,
} from "@/app/api/actions/balance/getPersonBalance";
import { formatNumber } from "@/utils/formatNumber";
import { labels } from "@/utils/label";
import { shopTypeLabel } from "@/utils/shopType";
import {
  exportPersonBalanceToExcel,
  roleOf,
} from "@/utils/personBalanceExcel";
import { cn } from "@/lib/utils";
import { Person } from "@prisma/client";

interface PersonBalanceDisplayProps {
  person: Person;
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
            {labels.idNumber}: {person.IdNumber} — {labels.primaryPhone}:{" "}
            {person.phoneOne}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={units.length === 0}
        >
          <Download className="ml-2 h-4 w-4" />
          {labels.downloadAsExcel}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={labels.personNetBalance}
          value={formatNumber(summary.balance)}
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{labels.personUnitsTitle}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {labels.personUnitsHint}
          </p>
        </CardHeader>
        <CardContent>
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
              <TableBody>
                {units.map((unit, index) => (
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
                    <TableCell className="text-center">
                      {roleOf(unit)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(unit.totalCharge)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(unit.totalPayment)}
                    </TableCell>
                    <TableCell
                      className={cn("text-center font-semibold", toneOf(unit.balance))}
                    >
                      {formatNumber(unit.balance)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge balance={unit.balance} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/shop-balance-detail/${unit.shopId}`}>
                          {labels.viewShopLedger}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-center font-bold">
                    {labels.grandTotal}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {formatNumber(summary.totalCharge)}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {formatNumber(summary.totalPayment)}
                  </TableCell>
                  <TableCell
                    className={cn("text-center font-bold", toneOf(summary.balance))}
                  >
                    {formatNumber(summary.balance)}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge balance={summary.balance} />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
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
