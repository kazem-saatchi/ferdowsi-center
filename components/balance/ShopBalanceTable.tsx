import { formatNumber, toPersianDigits } from "@/utils/formatNumber";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ShopBalanceData } from "@/schema/balanceSchema";
import { labels } from "@/utils/label";
import BalanceAmount from "./BalanceAmount";

interface ShopBalanceProps {
  shopBalance: ShopBalanceData;
}

function ShopBalanceTable({ shopBalance }: ShopBalanceProps) {
  const monthlyBalance =
    shopBalance?.totalChargeMonthly - shopBalance.totalPaymentMonthly;
  const yearlyBalance =
    shopBalance?.totalChargeYearly - shopBalance.totalPaymentYearly;

  return (
    <>
      {/* Mobile card */}
      <Card className="md:hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {labels.plaque}
            </span>
            <span className="font-bold">{toPersianDigits(shopBalance?.plaque)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {labels.totalBalanceMonthly}
            </span>
            <span className="font-medium break-all">
              <BalanceAmount value={monthlyBalance} debtSign="positive" />
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {labels.totalBalanceYearly}
            </span>
            <span className="font-medium break-all">
              <BalanceAmount value={yearlyBalance} debtSign="positive" />
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <span className="text-sm font-medium">{labels.totalBalance}</span>
            <span className="font-bold break-all">
              <BalanceAmount value={shopBalance?.balance ?? 0} debtSign="positive" />
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">{labels.plaque}</TableHead>
              <TableHead className="text-center">
                {labels.totalBalanceMonthly}
              </TableHead>
              <TableHead className="text-center">
                {labels.totalBalanceYearly}
              </TableHead>
              <TableHead className="text-center">
                {labels.totalBalance}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-center">
                {toPersianDigits(shopBalance?.plaque)}
              </TableCell>
              <TableCell className="text-center">
                <BalanceAmount value={monthlyBalance} debtSign="positive" />
              </TableCell>
              <TableCell className="text-center">
                <BalanceAmount value={yearlyBalance} debtSign="positive" />
              </TableCell>
              <TableCell className="text-center">
                <BalanceAmount value={shopBalance?.balance ?? 0} debtSign="positive" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default ShopBalanceTable;
