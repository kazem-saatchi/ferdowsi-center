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
            <TableCell className="text-center">{balance.plaque}</TableCell>
            <TableCell className="text-center">
              {balance.totalCharge.toLocaleString()}
            </TableCell>
            <TableCell className="text-center">
              {balance.totalPayment.toLocaleString()}
            </TableCell>
            <TableCell className="text-center">
              {(balance.totalCharge - balance.totalPayment).toLocaleString()}{" "}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
