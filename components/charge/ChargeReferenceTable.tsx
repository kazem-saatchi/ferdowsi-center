import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { labels } from "@/utils/label";
import { formatNumber } from "@/utils/formatNumber";
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
          <TableHead className="text-center">
            <Button variant="ghost">{labels.plaque}</Button>
          </TableHead>
          <TableHead className="text-center">
            <Button variant="ghost">{labels.areaM2}</Button>
          </TableHead>
          <TableHead className="text-center">
            <Button variant="ghost">{labels.constAmount}</Button>
          </TableHead>
          <TableHead className="text-center">
            <Button variant="ghost">{labels.metricAmount}</Button>
          </TableHead>
          <TableHead className="text-center">
            <Button variant="ghost">{labels.totalCharge}</Button>
          </TableHead>
          <TableHead className="text-center">
            <Button variant="ghost">{labels.date}</Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {chargeReferences.map((reference) => (
          <TableRow key={reference.id}>
            <TableCell className="text-center">{reference.plaque}</TableCell>
            <TableCell className="text-center">
              {reference.area.toFixed(2)}
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
            <TableCell className="text-center">{reference.year}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ChargeReferenceTable;
