import { formatNumber, toPersianDigits } from "@/utils/formatNumber";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShopBalanceData } from "@/schema/balanceSchema";
import { labels } from "@/utils/label";

interface BalanceTableProps {
  balances: ShopBalanceData[];
}

export function BalanceTable({ balances }: BalanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.totalCharge}</TableHead>
          <TableHead className="text-center">{labels.totalPayment}</TableHead>
          <TableHead className="text-center">{labels.totalBalance}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {balances.map((balance) => (
          <TableRow key={balance.shopId}>
            <TableCell className="text-center">{toPersianDigits(balance.plaque)}</TableCell>
            <TableCell className="text-center">
              {formatNumber(balance.totalCharge)}
            </TableCell>
            <TableCell className="text-center">
              {formatNumber(balance.totalPayment)}
            </TableCell>
            <TableCell className="text-center">
              {formatNumber(balance.totalCharge - balance.totalPayment)}{" "}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
