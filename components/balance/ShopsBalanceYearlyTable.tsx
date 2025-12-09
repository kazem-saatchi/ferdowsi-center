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
import { formatNumber } from "@/utils/formatNumber";
import { labels } from "@/utils/label";

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
              <TableCell className="text-center">{shop.plaque}</TableCell>
              <TableCell className="text-center">{shop.ownerName}</TableCell>
              {isDetailed && (
                <>
                  <TableCell className="text-center font-semibold text-green-600 dark:text-green-400">
                    {formatNumber(shop.ownerBalance)}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-orange-600 dark:text-orange-400">
                    {formatNumber(shop.renterBalance)}
                  </TableCell>
                </>
              )}
              <TableCell className="text-center font-semibold">
                {formatNumber(balance)}
              </TableCell>
              <TableCell className="text-center">
                {balance > 0 ? "طلبکار" : balance == 0 ? "تسویه" : " بدهکار"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
