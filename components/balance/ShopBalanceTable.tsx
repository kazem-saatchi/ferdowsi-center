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
            <span className="font-bold">{shopBalance?.plaque}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {labels.totalBalanceMonthly}
            </span>
            <span className="font-medium break-all">
              {monthlyBalance.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {labels.totalBalanceYearly}
            </span>
            <span className="font-medium break-all">
              {yearlyBalance.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <span className="text-sm font-medium">{labels.totalBalance}</span>
            <span className="font-bold break-all">
              {shopBalance?.balance.toLocaleString()}
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
                {shopBalance?.plaque}
              </TableCell>
              <TableCell className="text-center">
                {monthlyBalance.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">
                {yearlyBalance.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">
                {shopBalance?.balance.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default ShopBalanceTable;
