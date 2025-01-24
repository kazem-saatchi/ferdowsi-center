import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/utils/formatNumber";
import { labels } from "@/utils/label";
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
          <TableHead className="text-center">{labels.title}</TableHead>
          <TableHead className="text-center">{labels.amount}</TableHead>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.personName}</TableHead>
          <TableHead className="text-center">{labels.date}</TableHead>
          <TableHead className="text-center">{labels.operationName}</TableHead>
          <TableHead className="text-center">{labels.daysCount}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {charges.map((charge) => (
          <TableRow key={charge.id}>
            <TableCell className="text-center">{charge.title}</TableCell>
            <TableCell className="text-center text-xl">{formatNumber(charge.amount)}</TableCell>
            <TableCell className="text-center">{charge.plaque}</TableCell>
            <TableCell className="text-center">{charge.personName}</TableCell>
            <TableCell className="text-center text-xl">
              {new Date(charge.date).toLocaleDateString('fa-IR')}
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
