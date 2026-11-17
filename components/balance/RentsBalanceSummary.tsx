import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatNumber, toPersianDigits } from "@/utils/formatNumber";
import { formatJalaliDate } from "@/utils/localeDate";
import { labels } from "@/utils/label";
import type { RentBalanceSummary } from "@/utils/rentBalance";
import BalanceAmount from "./BalanceAmount";

function Stat({
  label,
  children,
  tone,
}: {
  label: string;
  children: ReactNode;
  tone?: "debt" | "credit" | "warn";
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-bold tabular-nums",
          tone === "debt" && "text-red-600 dark:text-red-400",
          tone === "credit" && "text-green-600 dark:text-green-400",
          tone === "warn" && "text-amber-700 dark:text-amber-400"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Totals over the rows the filters keep, plus how current the bank data is:
 *  payments made after that date are not in these numbers yet. */
export function RentsBalanceSummary({
  summary,
  lastBankTransactionDate,
}: {
  summary: RentBalanceSummary;
  lastBankTransactionDate?: Date | null;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Stat label={labels.rentTotalDebt} tone="debt">
        {formatNumber(summary.totalDebt)}
      </Stat>
      <Stat label={labels.rentDebtorUnits} tone={summary.debtorCount ? "debt" : undefined}>
        {toPersianDigits(summary.debtorCount)} {labels.of}{" "}
        {toPersianDigits(summary.unitCount)}
      </Stat>
      <Stat label={labels.rentTotalCredit} tone="credit">
        {formatNumber(summary.totalCredit)}
      </Stat>
      <Stat label={labels.rentNet}>
        <BalanceAmount value={summary.net} debtSign="negative" />
      </Stat>
      <Stat
        label={labels.rentUnitsMissingRent}
        tone={summary.missingRentCount ? "warn" : undefined}
      >
        {toPersianDigits(summary.missingRentCount)}
      </Stat>
      <Stat label={labels.rentBankDataUntil}>
        {lastBankTransactionDate
          ? formatJalaliDate(lastBankTransactionDate)
          : labels.rentNoBankData}
      </Stat>
    </div>
  );
}
