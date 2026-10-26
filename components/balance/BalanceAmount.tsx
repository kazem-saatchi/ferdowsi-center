import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/formatNumber";
import { labels } from "@/utils/label";

/** Which sign means "owes money". The pages do not agree: the all-shops lists
 *  store payment − charge (negative is a debt), while the single-shop and
 *  person pages store charge − payment (positive is a debt). */
export type DebtSign = "negative" | "positive";

export function isDebt(value: number, debtSign: DebtSign): boolean {
  return debtSign === "negative" ? value < 0 : value > 0;
}

export function balanceStatusLabel(value: number, debtSign: DebtSign): string {
  if (value === 0) return labels.statusSettled;
  return isDebt(value, debtSign) ? labels.statusDebtor : labels.statusCreditor;
}

/** A balance shown the way an accountant reads it: the amount without a sign,
 *  plus a red "بدهکار" or green "بستانکار" tag. A bare minus sign is easy to
 *  miss, and in right-to-left text it lands on the wrong side of the number. */
export default function BalanceAmount({
  value,
  debtSign,
  hideLabel = false,
  className,
}: {
  value: number;
  debtSign: DebtSign;
  hideLabel?: boolean;
  className?: string;
}) {
  const tone =
    value === 0
      ? "text-muted-foreground"
      : isDebt(value, debtSign)
        ? "text-red-600 dark:text-red-400"
        : "text-green-600 dark:text-green-400";

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 whitespace-nowrap",
        tone,
        className
      )}
    >
      <span className="tabular-nums">{formatNumber(Math.abs(value))}</span>
      {!hideLabel && (
        <span className="text-xs font-normal">
          {balanceStatusLabel(value, debtSign)}
        </span>
      )}
    </span>
  );
}
