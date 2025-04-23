import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChargePaymentData } from "@/schema/balanceSchema";
import { OwnerRenterBalance } from "@/store/balanceSlice";
import { labels } from "@/utils/label";

interface BalanceProps {
  ownerData: OwnerRenterBalance;
  renterData?: OwnerRenterBalance;
}

function OwnerRenterBalanceTable({ ownerData, renterData }: BalanceProps) {
  const totalCalculator = (
    charges: ChargePaymentData[],
    payments: ChargePaymentData[]
  ): {
    monthlyBalance: number;
    yearlyBalance: number;
    totalBalance: number;
  } => {
    const monthlyBalance: number =
      charges
        .filter((charge) => !charge.proprietor)
        .reduce((total, charge) => total + charge.amount, 0) -
      payments
        .filter((payment) => !payment.proprietor)
        .reduce((total, payment) => total + payment.amount, 0);
    const yearlyBalance: number =
      charges
        .filter((charge) => charge.proprietor)
        .reduce((total, charge) => total + charge.amount, 0) -
      payments
        .filter((payment) => payment.proprietor)
        .reduce((total, payment) => total + payment.amount, 0);
    const totalBalance: number =
      charges.reduce((total, charge) => total + charge.amount, 0) -
      payments.reduce((total, payment) => total + payment.amount, 0);

    return { monthlyBalance, yearlyBalance, totalBalance };
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.title}</TableHead>
          <TableHead className="text-center">{labels.personName}</TableHead>
          <TableHead className="text-center">
            {labels.totalBalanceMonthly}
          </TableHead>
          <TableHead className="text-center">
            {labels.totalBalanceYearly}
          </TableHead>
          <TableHead className="text-center">{labels.totalBalance}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ownerData && (
          <TableRow>
            <TableCell className="text-center">{labels.owner}</TableCell>
            <TableCell className="text-center">{`${ownerData.person.firstName} ${ownerData.person.lastName}`}</TableCell>
            <TableCell className="text-center">
              {totalCalculator(
                ownerData.chargeList,
                ownerData.paymentList
              ).monthlyBalance.toLocaleString()}
            </TableCell>
            <TableCell className="text-center">
              {totalCalculator(
                ownerData.chargeList,
                ownerData.paymentList
              ).yearlyBalance.toLocaleString()}
            </TableCell>
            <TableCell className="text-center">
              {totalCalculator(
                ownerData.chargeList,
                ownerData.paymentList
              ).totalBalance.toLocaleString()}
            </TableCell>
          </TableRow>
        )}
        {renterData && (
          <TableRow>
            <TableCell className="text-center">{labels.renter}</TableCell>
            <TableCell className="text-center">{`${renterData.person.firstName} ${renterData.person.lastName}`}</TableCell>
            <TableCell className="text-center">
              {totalCalculator(
                renterData.chargeList,
                renterData.paymentList
              ).monthlyBalance.toLocaleString()}
            </TableCell>
            <TableCell className="text-center">
              {totalCalculator(
                renterData.chargeList,
                renterData.paymentList
              ).yearlyBalance.toLocaleString()}
            </TableCell>
            <TableCell className="text-center">
              {totalCalculator(
                renterData.chargeList,
                renterData.paymentList
              ).totalBalance.toLocaleString()}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default OwnerRenterBalanceTable;
