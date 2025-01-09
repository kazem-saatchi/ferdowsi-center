import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShopBalanceData } from "@/schema/balanceSchema";


interface BalanceTableProps {
  balances: ShopBalanceData[];
}

export function BalanceTable({ balances }: BalanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Plaque</TableHead>
          <TableHead className="text-center">Total Charge</TableHead>
          <TableHead className="text-center">Total Payment</TableHead>
          <TableHead className="text-center">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {balances.map((balance) => (
          <TableRow key={balance.shopId}>
            <TableCell className="text-center">{balance.plaque}</TableCell>
            <TableCell className="text-center">
              {balance.totalCharge.toLocaleString()} Rials
            </TableCell>
            <TableCell className="text-center">
              {balance.totalPayment.toLocaleString()} Rials
            </TableCell>
            <TableCell className="text-center">
              {(balance.totalCharge - balance.totalPayment).toLocaleString()}{" "}
              Rials
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
