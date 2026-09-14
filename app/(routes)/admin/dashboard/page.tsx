"use client";

import Link from "next/link";
import {
  Banknote,
  BarChart2,
  Building2,
  CalendarClock,
  CreditCard,
  Home,
  ReceiptText,
  TrendingDown,
  Users,
} from "lucide-react";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAdminDashboard } from "@/tanstack/query/dashboardQuery";
import type {
  BucketSummary,
} from "@/app/api/actions/reports/getAdminDashboard";
import { formatNumber } from "@/utils/formatNumber";
import { formatPersianDate } from "@/utils/localeDate";
import { labels } from "@/utils/label";
import { SHOP_TYPE_LABELS } from "@/utils/shopType";
import type { ShopType } from "@prisma/client";


/** Share of everything charged that has actually been paid. */
function collectionRate(summary: BucketSummary): string {
  if (summary.chargeTotal <= 0) return "—";
  const percent = Math.round((summary.paymentTotal / summary.chargeTotal) * 100);
  return `${formatNumber(percent)}٪`;
}

function debtHint(summary: BucketSummary): string {
  return `${formatNumber(summary.debtorCount)} ${labels.debtorUnitsCount} ${
    labels.fromUnitsCount
  } ${formatNumber(summary.unitCount)} — ${labels.collectionRate} ${collectionRate(
    summary
  )}`;
}

export default function AdminDashboardPage() {
  const { data: response, isLoading, isError, error, refetch } =
    useGetAdminDashboard();

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError || !response?.success || !response.data) {
    return (
      <ErrorComponent
        // A failed action resolves with success:false rather than throwing, so
        // react-query reports no error object — carry its message across.
        error={error ?? new Error(response?.message || labels.errorOccurred)}
        message={response?.message || labels.errorOccurred}
        retry={refetch}
      />
    );
  }

  const { shops, personCount, bank, balances, topDebtors, recent } =
    response.data;

  const shopTypeSummary = shops.byType
    .map((entry) => `${SHOP_TYPE_LABELS[entry.type]} ${formatNumber(entry.count)}`)
    .join(" · ");

  return (
    <div className="space-y-6 px-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{labels.dashboardTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {labels.dashboardSubtitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {labels.dashboardDataAsOf}
          {": "}
          {bank.lastTransactionDate
            ? formatPersianDate(new Date(bank.lastTransactionDate))
            : labels.noBankDataYet}
        </p>
      </div>

      {/* ── What the complex is owed ── */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title={labels.monthlyChargeDebt}
          value={formatNumber(balances.monthly.debtTotal)}
          hint={debtHint(balances.monthly)}
          icon={TrendingDown}
          href="/admin/all-shops-monthly-balance"
        />
        <StatCard
          title={labels.proprietorChargeDebt}
          value={formatNumber(balances.proprietor.debtTotal)}
          hint={debtHint(balances.proprietor)}
          icon={TrendingDown}
          href="/admin/all-shops-yearly-balance"
        />
        <StatCard
          title={labels.rentDebtTitle}
          value={formatNumber(balances.rent.debtTotal)}
          hint={debtHint(balances.rent)}
          icon={TrendingDown}
          href="/admin/all-rents-balance"
        />
      </section>

      {/* ── Bank and inventory ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={labels.unregisteredPayments}
          value={formatNumber(bank.pendingCardTransfers)}
          hint={labels.unregisteredPaymentsHint}
          icon={CreditCard}
          href="/admin/card-transfer"
          emphasis={bank.pendingCardTransfers > 0 ? "warning" : "default"}
        />
        <StatCard
          title={labels.bankBalanceTitle}
          value={
            bank.lastBalance != null
              ? formatNumber(bank.lastBalance)
              : labels.noBankDataYet
          }
          hint={
            bank.lastTransactionDate
              ? `${labels.lastBankTransactionTitle}: ${formatPersianDate(
                  new Date(bank.lastTransactionDate)
                )}`
              : undefined
          }
          icon={Banknote}
          href="/admin/import-net-bank"
        />
        <StatCard
          title={labels.unitsCountTitle}
          value={formatNumber(shops.total)}
          hint={`${labels.activeUnitsCount} ${formatNumber(
            shops.active
          )} · ${labels.rentedUnitsCount} ${formatNumber(shops.rented)}`}
          icon={Building2}
          href="/admin/all-shops"
        />
        <StatCard
          title={labels.personsCountTitle}
          value={formatNumber(personCount)}
          hint={shopTypeSummary}
          icon={Users}
          href="/admin/all-persons"
        />
      </section>

      {/* ── Recent activity ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title={labels.paymentsRegistered}
          value={formatNumber(recent.paymentTotal)}
          hint={`${formatNumber(recent.paymentCount)} ${labels.paymentsRegistered} ${
            labels.lastDaysPrefix
          } ${formatNumber(recent.days)} ${labels.lastDaysSuffix}`}
          icon={ReceiptText}
          href="/admin/all-payments"
        />
        <StatCard
          title={labels.chargesIssued}
          value={formatNumber(recent.chargeTotal)}
          hint={`${formatNumber(recent.chargeCount)} ${labels.chargesIssued} ${
            labels.lastDaysPrefix
          } ${formatNumber(recent.days)} ${labels.lastDaysSuffix}`}
          icon={CalendarClock}
          href="/admin/all-charges-list"
        />
      </section>

      {/* ── Worst debtors ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart2 className="h-5 w-5" />
            {labels.topDebtorsTitle}
          </CardTitle>
          <CardDescription>{labels.topDebtorsHint}</CardDescription>
        </CardHeader>
        <CardContent>
          {topDebtors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {labels.noDebtorsFound}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">{labels.plaque}</TableHead>
                  <TableHead className="text-center">
                    {labels.ownerName}
                  </TableHead>
                  <TableHead className="text-center">
                    {labels.renterName}
                  </TableHead>
                  <TableHead className="text-center">
                    {labels.totalBalance}
                  </TableHead>
                  <TableHead className="text-center" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDebtors.map((debtor) => (
                  <TableRow key={debtor.shopId}>
                    <TableCell className="text-center">
                      {formatNumber(debtor.plaque)}
                    </TableCell>
                    <TableCell className="text-center">
                      {debtor.ownerName}
                    </TableCell>
                    <TableCell className="text-center">
                      {debtor.renterName || "------"}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-red-600 dark:text-red-400">
                      {formatNumber(debtor.debt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/shop-balance-detail/${debtor.shopId}`}>
                          {labels.viewShopLedger}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Quick access ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5" />
            {labels.quickAccessTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild variant="outline">
            <Link href="/admin/import-net-bank">
              {labels.importBankDataCard}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/card-transfer">
              {labels.unregisteredPaymentsCard}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/shop-balance-detail">
              {labels.shopBalanceDetailCard}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/all-shops-monthly-balance">
              {labels.monthlyBalanceListCard}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
