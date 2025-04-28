import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ShopsBalanceData } from "@/schema/balanceSchema";
import { formatNumber } from "@/utils/formatNumber";
import { labels } from "@/utils/label";

interface BalanceTableProps {
  shopsBlances: ShopsBalanceData[];
}

export function ShopsBalanceYearlyTable({ shopsBlances }: BalanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.ownerName}</TableHead>
          {/* <TableHead className="text-center">{labels.renterName}</TableHead> */}
          <TableHead className="text-center">{labels.totalBalance}</TableHead>
          <TableHead className="text-center">{labels.status}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shopsBlances.map((shop) => (
          <TableRow
            key={shop.plaque}
            className={cn(
              shop.balance > 0 && "text-green-500",
              shop.balance === 0 && "text-blue-500"
            )}
          >
            <TableCell className="text-center">{shop.plaque}</TableCell>
            <TableCell className="text-center">{shop.ownerName}</TableCell>
            
            <TableCell className="text-center">
              {formatNumber(shop.balance)}
            </TableCell>
            <TableCell className="text-center">
              {shop.balance > 0
                ? "طلبکار"
                : shop.balance == 0
                ? "تسویه"
                : " بدهکار"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
