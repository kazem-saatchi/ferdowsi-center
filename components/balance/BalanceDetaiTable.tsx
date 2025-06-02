import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChargePaymentData } from "@/schema/balanceSchema";
import { labels } from "@/utils/label";
import { Charge, Payment } from "@prisma/client";
import { Separator } from "../ui/separator";
import { formatPersianDate } from "@/utils/localeDate";

interface BalanceTableProps {
  charges: Charge[];
  payments: Payment[];
}

// type BalanceItem = {
//   type: string;
//   id: string;
//   title: string;
//   amount: number;
//   date: Date;
//   proprietor: boolean;
// };

type TotalBalance = {
  charge: number;
  payment: number;
  balance: number;
};

export function BalanceDetailTable({ charges, payments }: BalanceTableProps) {
  const balanceData = [
    ...charges.map((charge) => ({
      ...charge,
      title: charge.title,
      type: "charge",
    })),
    ...payments.map((payment) => ({
      ...payment,
      title: payment.title,
      type: "payment",
    })),
  ].sort((a, b) => {
    const dateA = a.date?.getTime() || 0;
    const dateB = b.date?.getTime() || 0;
    return dateB - dateA; // newest first
  });

  // Calculate totals for better organization
  const totalBalance: TotalBalance = {
    charge: balanceData
      .filter((item) => item.type === "charge")
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    payment: balanceData
      .filter((item) => item.type === "payment")
      .reduce((sum, item) => sum + (item.amount || 0), 0),
    balance: balanceData.reduce((sum, item) => {
      return item.type === "charge" ? sum + item.amount : sum - item.amount;
    }, 0),
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.type}</TableHead>
          <TableHead className="text-center">{labels.title}</TableHead>
          <TableHead className="text-center">{labels.date}</TableHead>
          <TableHead className="text-center">{labels.amount}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {balanceData.map((item) => (
          <TableRow key={`${item.type}-${item.id}`}>
            <TableCell className="text-center capitalize">
              {item.type === "charge" ? labels.charge : labels.payment}
            </TableCell>
            <TableCell className="text-center">{item.title}</TableCell>
            <TableCell className="text-center">
              {formatPersianDate(item.date)}
            </TableCell>
            <TableCell
              className={`text-center ${
                item.type === "charge" ? "text-red-500" : "text-green-500"
              }`}
            >
              {/* {item.type === "charge" ? "+" : "-"} */}
              {item.amount.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      <TableFooter>
        <TableRow>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell className="text-center font-medium border-2">
            {labels.totalBalance}
          </TableCell>
          <TableCell
            className={`text-center font-bold border-2 ${
              totalBalance.balance > 0
                ? "text-red-500"
                : totalBalance.balance < 0
                ? "text-green-500"
                : ""
            }`}
          >
            {totalBalance.balance.toLocaleString()}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
