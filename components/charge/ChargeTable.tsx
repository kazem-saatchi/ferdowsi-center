import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Charge } from "@prisma/client";
import { format } from "date-fns";

interface ChargeTableProps {
  charges: Charge[];
}

export function ChargeTable({ charges }: ChargeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Title</TableHead>
          <TableHead className="text-center">Amount</TableHead>
          <TableHead className="text-center">Shop Plaque</TableHead>
          <TableHead className="text-center">Person Name</TableHead>
          <TableHead className="text-center">Date</TableHead>
          <TableHead className="text-center">Operation Name</TableHead>
          <TableHead className="text-center">Days Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {charges.map((charge) => (
          <TableRow key={charge.id}>
            <TableCell className="text-center">{charge.title}</TableCell>
            <TableCell className="text-center">{charge.amount}</TableCell>
            <TableCell className="text-center">{charge.plaque}</TableCell>
            <TableCell className="text-center">{charge.personName}</TableCell>
            <TableCell className="text-center">
              {format(new Date(charge.date), "PPP")}
            </TableCell>
            <TableCell className="text-center">
              {charge.operationName}
            </TableCell>
            <TableCell className="text-center">{charge.daysCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
