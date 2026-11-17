import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatNumber, toPersianDigits } from "@/utils/formatNumber";
import { formatJalaliDate } from "@/utils/localeDate";
import { labels } from "@/utils/label";
import { shopTypeLabel } from "@/utils/shopType";
import type { RentBalanceData } from "@/utils/rentBalance";
import BalanceAmount from "./BalanceAmount";

function DateCell({ date }: { date: Date | null }) {
  return (
    <TableCell className="text-center whitespace-nowrap tabular-nums">
      {date ? formatJalaliDate(date) : labels.noValue}
    </TableCell>
  );
}

/** The rent list for board and parking units: what each unit is billed per
 *  month, what has been billed and paid in total, and how far behind it is.
 *  The plaque opens that unit's full statement. */
export function RentsBalanceTable({ rows }: { rows: RentBalanceData[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.type}</TableHead>
          <TableHead className="text-center">{labels.ownerName}</TableHead>
          <TableHead className="text-center">{labels.renterName}</TableHead>
          <TableHead className="text-center">{labels.rentMonthly}</TableHead>
          <TableHead className="text-center">{labels.rentTotalCharged}</TableHead>
          <TableHead className="text-center">{labels.rentTotalPaid}</TableHead>
          <TableHead className="text-center">{labels.totalBalance}</TableHead>
          <TableHead className="text-center">{labels.rentMonthsBehind}</TableHead>
          <TableHead className="text-center">{labels.rentLastPayment}</TableHead>
          <TableHead className="text-center">{labels.rentLastCharge}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.shopId}>
            <TableCell className="text-center">
              <Link
                href={`/admin/shop-balance-detail/${row.shopId}`}
                className="font-semibold text-primary underline-offset-4 hover:underline"
                title={labels.rentOpenDetail}
              >
                {toPersianDigits(row.plaque)}
              </Link>
            </TableCell>
            <TableCell className="text-center whitespace-nowrap">
              {shopTypeLabel(row.type)}
            </TableCell>
            <TableCell className="text-center">{row.ownerName}</TableCell>
            <TableCell className="text-center">
              <div>{row.renterName || labels.noValue}</div>
              {row.rentStartDate && (
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {labels.rentStartDate}: {formatJalaliDate(row.rentStartDate)}
                </div>
              )}
            </TableCell>
            <TableCell className="text-center whitespace-nowrap tabular-nums">
              {row.monthlyRent > 0 ? (
                formatNumber(row.monthlyRent)
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500 text-amber-700 dark:text-amber-400"
                  title={labels.rentNotSetHint}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {labels.rentNotSet}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-center whitespace-nowrap tabular-nums">
              {formatNumber(row.totalCharge)}
            </TableCell>
            <TableCell className="text-center whitespace-nowrap tabular-nums">
              {formatNumber(row.totalPayment)}
            </TableCell>
            <TableCell className="text-center font-semibold">
              <BalanceAmount value={row.balance} debtSign="negative" />
            </TableCell>
            <TableCell className="text-center whitespace-nowrap">
              {row.monthsBehind !== null ? (
                <span
                  className={
                    row.monthsBehind >= 3
                      ? "font-semibold text-red-600 dark:text-red-400"
                      : undefined
                  }
                >
                  {toPersianDigits(row.monthsBehind)} {labels.rentMonthUnit}
                </span>
              ) : (
                labels.noValue
              )}
            </TableCell>
            <DateCell date={row.lastPaymentDate} />
            <DateCell date={row.lastChargeDate} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
