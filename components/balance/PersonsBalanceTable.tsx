import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersonBalanceData } from "@/schema/balanceSchema";

interface PersonBalanceProps {
  personsBalance: PersonBalanceData[];
}

function PersonsBalanceTable({ personsBalance }: PersonBalanceProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Person Name</TableHead>
          <TableHead className="text-center">Total Charge</TableHead>
          <TableHead className="text-center">Total Payment</TableHead>
          <TableHead className="text-center">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personsBalance &&
          personsBalance.map((person) => (
            <TableRow key={person.personId}>
              <TableCell className="text-center">{person.personName}</TableCell>
              <TableCell className="text-center">
                {person.totalCharge.toLocaleString()} Rials
              </TableCell>
              <TableCell className="text-center">
                {person.totalPayment.toLocaleString()} Rials
              </TableCell>
              <TableCell className="text-center">
                {person.balance.toLocaleString()} Rials
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

export default PersonsBalanceTable;
