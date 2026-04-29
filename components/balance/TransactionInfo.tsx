"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTransactionData } from "@/tanstack/query/bankQuery";
import { cn } from "@/lib/utils";
import {
  bankTransactionCategoryLabels,
  bankTransactionTypeLabels,
  labels,
} from "@/utils/label";
import { formatPersianDate } from "@/utils/localeDate";
import { AccountType } from "@prisma/client";
import { AlertCircle, Banknote, Calendar, Hash, Landmark } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

interface TransactionInfoProps {
  bankTransactionId: string;
}

function accountTypeLabel(accountType: AccountType): string {
  switch (accountType) {
    case "PROPRIETOR":
      return labels.proprietorType;
    case "BUSINESS":
      return labels.businessType;
    case "GENERAL":
      return labels.generalType;
    default:
      return String(accountType);
  }
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/35">
      {Icon ? (
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      ) : null}
      <div className="min-w-0 flex-1 space-y-0.5 text-right">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "break-words text-sm font-medium leading-relaxed text-foreground",
            valueClassName,
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function TransactionInfo({
  bankTransactionId,
}: TransactionInfoProps) {
  const { data, isLoading, error } = useGetTransactionData(bankTransactionId);

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <span className="sr-only">{labels.loadingTransactionDetails}</span>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4 max-w-md" />
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.25rem] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-destructive/50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{labels.errorLoadingTransactionDetails}</AlertTitle>
        <AlertDescription className="text-sm opacity-90">
          {labels.errorOccurred}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 py-12 text-center">
        <Landmark className="h-10 w-10 text-muted-foreground/70" />
        <p className="text-sm font-medium text-muted-foreground">
          {labels.transactionDataNotFound}
        </p>
      </div>
    );
  }

  const typeLabel =
    bankTransactionTypeLabels[data.type] ?? String(data.type);
  const categoryLabel = data.category
    ? (bankTransactionCategoryLabels[data.category] ?? String(data.category))
    : labels.notAvailable;

  const isIncome = data.type === "INCOME";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={isIncome ? "secondary" : "destructive"}
            className={cn(
              "px-3 py-1 text-xs font-semibold",
              isIncome &&
                "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
            )}
          >
            {typeLabel}
          </Badge>
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {accountTypeLabel(data.accountType)}
          </Badge>
        </div>
        <div className="flex flex-col items-end gap-0.5 rounded-lg bg-primary/10 px-3 py-2">
          <div className="flex items-baseline gap-1.5">
            <Banknote className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-lg font-bold tabular-nums tracking-tight text-primary">
              {data.amount.toLocaleString("fa-IR")}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {labels.amountInRials}
          </span>
        </div>
      </div>

      <p className="rounded-lg border bg-card px-3 py-2.5 text-sm leading-relaxed text-foreground shadow-sm">
        {data.description?.trim() ? data.description : labels.noDescription}
      </p>

      <Separator />

      <Card className="border-border/80 shadow-none">
        <CardContent className="grid gap-2 p-4 pt-4 sm:grid-cols-2">
          <DetailRow
            icon={Calendar}
            label={labels.transactionDateLabel}
            value={formatPersianDate(data.date)}
          />
          <DetailRow
            icon={Calendar}
            label={labels.systemRecordedAt}
            value={formatPersianDate(data.createdAt)}
          />
          <DetailRow
            label={labels.transactionCategory}
            value={categoryLabel}
          />
          <DetailRow
            label={labels.senderBankAccount}
            value={data.senderAccount?.trim() || labels.notAvailable}
          />
          <DetailRow
            label={labels.bankAccountNumberDestination}
            value={data.recieverAccount?.trim() || labels.notAvailable}
          />
          <DetailRow
            label={labels.bankAccountNumber}
            value={data.bankAccountNumber?.trim() || labels.notAvailable}
          />
          <DetailRow
            icon={Hash}
            label={labels.bankStatementNumber}
            value={data.bankReferenceId}
          />
          <DetailRow
            label={labels.bankReceiptNumberLabel}
            value={
              data.bankRecieptId?.trim() ? data.bankRecieptId : labels.notAvailable
            }
          />
          <DetailRow
            label={labels.branchCode}
            value={
              data.branch != null
                ? data.branch.toLocaleString("fa-IR")
                : labels.notAvailable
            }
          />
          <DetailRow
            label={labels.balanceAfterTransaction}
            value={data.balance.toLocaleString("fa-IR")}
            valueClassName="tabular-nums"
          />
        </CardContent>
      </Card>
    </div>
  );
}
