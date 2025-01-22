import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersonBalanceData } from "@/schema/balanceSchema";
import { labels } from "@/utils/label";

interface PersonBalanceProps {
  personsBalance: PersonBalanceData[];
}

function PersonsBalanceTable({ personsBalance }: PersonBalanceProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.personName}</TableHead>
          <TableHead className="text-center">{labels.totalCharge}</TableHead>
          <TableHead className="text-center">{labels.totalPayment}</TableHead>
          <TableHead className="text-center">{labels.totalBalance}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personsBalance &&
          personsBalance.map((person) => (
            <TableRow key={person.personId}>
              <TableCell className="text-center">{person.personName}</TableCell>
              <TableCell className="text-center">
                {person.totalCharge.toLocaleString()} 
              </TableCell>
              <TableCell className="text-center">
                {person.totalPayment.toLocaleString()} 
              </TableCell>
              <TableCell className="text-center">
                {person.balance.toLocaleString()} 
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

export default PersonsBalanceTable;
