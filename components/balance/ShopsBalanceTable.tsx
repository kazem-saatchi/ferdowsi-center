import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShopsBalanceData } from "@/schema/balanceSchema";
import { labels } from "@/utils/label";

interface BalanceTableProps {
  shopsBlances: ShopsBalanceData[];
}

export function ShopsBalanceTable({ shopsBlances }: BalanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.ownerName}</TableHead>
          <TableHead className="text-center">{labels.renterName}</TableHead>
          <TableHead className="text-center">{labels.totalBalance}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shopsBlances.map((shop) => (
          <TableRow key={shop.plaque}>
            <TableCell className="text-center">{shop.plaque}</TableCell>
            <TableCell className="text-center">{shop.ownerName}</TableCell>
            <TableCell className="text-center">
              {shop.renterName ? shop.renterName : "بدون مستاجر"}
            </TableCell>
            <TableCell className="text-center">
              {shop.balance.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
