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

interface ShopBalanceProps {
  shopBalance: ShopBalanceData;
}

function ShopBalanceTable({ shopBalance }: ShopBalanceProps) {
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
        <TableRow>
          <TableCell className="text-center">{shopBalance?.plaque}</TableCell>
          <TableCell className="text-center">
            {shopBalance?.totalCharge.toLocaleString()}
          </TableCell>
          <TableCell className="text-center">
            {shopBalance?.totalPayment.toLocaleString()}
          </TableCell>
          <TableCell className="text-center">
            {shopBalance && (shopBalance?.balance).toLocaleString()}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default ShopBalanceTable;
