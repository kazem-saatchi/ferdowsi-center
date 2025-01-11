import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShopBalanceData } from "@/schema/balanceSchema";

interface ShopBalanceProps {
  shopBalance: ShopBalanceData;
}

function ShopBalanceTable({ shopBalance }: ShopBalanceProps) {
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
        <TableRow>
          <TableCell className="text-center">{shopBalance?.plaque}</TableCell>
          <TableCell className="text-center">
            {shopBalance?.totalCharge.toLocaleString()} Rials
          </TableCell>
          <TableCell className="text-center">
            {shopBalance?.totalPayment.toLocaleString()} Rials
          </TableCell>
          <TableCell className="text-center">
            {shopBalance && (shopBalance?.balance).toLocaleString()} Rials
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default ShopBalanceTable;
