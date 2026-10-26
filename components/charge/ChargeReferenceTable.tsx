import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { labels } from "@/utils/label";
import { formatNumber, toPersianDigits } from "@/utils/formatNumber";
import { ShopChargeReference } from "@prisma/client";

function ChargeReferenceTable({
  chargeReferences,
}: {
  chargeReferences: ShopChargeReference[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.areaM2}</TableHead>
          <TableHead className="text-center">{labels.constAmount}</TableHead>
          <TableHead className="text-center">{labels.metricAmount}</TableHead>
          <TableHead className="text-center">{labels.totalCharge}</TableHead>
          <TableHead className="text-center">{labels.date}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {chargeReferences.map((reference) => (
          <TableRow key={reference.id}>
            <TableCell className="text-center">{toPersianDigits(reference.plaque)}</TableCell>
            <TableCell className="text-center">
              {toPersianDigits(reference.area.toFixed(2))}
            </TableCell>
            <TableCell className="text-center text-2xl">
              {formatNumber(reference.constantAmount)}
            </TableCell>
            <TableCell className="text-center text-2xl">
              {formatNumber(reference.metricAmount)}
            </TableCell>
            <TableCell className="text-center text-2xl">
              {formatNumber(reference.totalAmount)}
            </TableCell>
            <TableCell className="text-center">{toPersianDigits(reference.year)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ChargeReferenceTable;
