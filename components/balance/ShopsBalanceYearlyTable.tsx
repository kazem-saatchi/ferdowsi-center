import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ShopsBalanceData, ShopBalanceDetails } from "@/schema/balanceSchema";
import { toPersianDigits } from "@/utils/formatNumber";
import { labels } from "@/utils/label";
import BalanceAmount, { balanceStatusLabel } from "./BalanceAmount";

interface BalanceTableProps {
  shopsBlances: ShopsBalanceData[] | ShopBalanceDetails[];
}

// Type guard to check if this is ShopBalanceDetails
function isShopBalanceDetails(
  shop: ShopsBalanceData | ShopBalanceDetails
): shop is ShopBalanceDetails {
  return "totalBalance" in shop;
}

// Function to get the appropriate balance value
function getBalance(shop: ShopsBalanceData | ShopBalanceDetails): number {
  return isShopBalanceDetails(shop) ? shop.totalBalance : shop.balance;
}

export function ShopsBalanceYearlyTable({ shopsBlances }: BalanceTableProps) {
  const hasDetailedBalances =
    shopsBlances.length > 0 && isShopBalanceDetails(shopsBlances[0]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.ownerName}</TableHead>
          {hasDetailedBalances && (
            <>
              <TableHead className="text-center">
                {labels.totalProprietorBalance}
              </TableHead>
              <TableHead className="text-center">
                {labels.totalRenterBalance}
              </TableHead>
            </>
          )}
          <TableHead className="text-center">{labels.totalBalance}</TableHead>
          <TableHead className="text-center">{labels.status}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shopsBlances.map((shop) => {
          const balance = getBalance(shop);
          const isDetailed = isShopBalanceDetails(shop);
          return (
            <TableRow
              key={shop.plaque}
              className={cn(
                balance > 0 && "text-green-500",
                balance === 0 && "text-blue-500"
              )}
            >
              <TableCell className="text-center">{toPersianDigits(shop.plaque)}</TableCell>
              <TableCell className="text-center">{shop.ownerName}</TableCell>
              {isDetailed && (
                <>
                  <TableCell className="text-center font-semibold">
                    <BalanceAmount value={shop.ownerBalance} debtSign="negative" hideLabel />
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    <BalanceAmount value={shop.renterBalance} debtSign="negative" hideLabel />
                  </TableCell>
                </>
              )}
              <TableCell className="text-center font-semibold">
                <BalanceAmount value={balance} debtSign="negative" hideLabel />
              </TableCell>
              <TableCell className="text-center">
                {balanceStatusLabel(balance, "negative")}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
