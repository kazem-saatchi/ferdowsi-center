import { toPersianDigits } from "@/utils/formatNumber";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shop } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { labels } from "@/utils/label";
import { shopTypeLabel } from "@/utils/shopType";

interface ShopsTableProps {
  shops: Shop[];
}

export function ShopsTable({ shops }: ShopsTableProps) {
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.areaM2}</TableHead>
          <TableHead className="text-center">{labels.floorNumber}</TableHead>
          <TableHead className="text-center">{labels.ownerName}</TableHead>
          <TableHead className="text-center">{labels.renterName}</TableHead>
          <TableHead className="text-center">{labels.status}</TableHead>
          <TableHead className="text-center">{labels.type}</TableHead>
          <TableHead className="text-center">{labels.histories}</TableHead>
          <TableHead className="text-center">{labels.charges}</TableHead>
          <TableHead className="text-center">{labels.balance}</TableHead>
          <TableHead className="text-center">{labels.edit}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shops.map((shop) => (
          <TableRow key={shop.id}>
            <TableCell className="text-center">{toPersianDigits(shop.plaque)}</TableCell>
            <TableCell className="text-center">{toPersianDigits(shop.area)}</TableCell>
            <TableCell className="text-center">{toPersianDigits(shop.floor)}</TableCell>
            <TableCell className="text-center">{shop.ownerName}</TableCell>
            <TableCell className="text-center">
              {shop.renterName || labels.noValue}
            </TableCell>
            <TableCell className="text-center">
              {shop.isActive ? labels.active : labels.inactive}
            </TableCell>
            <TableCell className="text-center">
              {shopTypeLabel(shop.type)}
            </TableCell>
            <TableCell className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/history-by-shop/${shop.id}`}>{labels.view}</Link>
              </Button>
            </TableCell>
            <TableCell className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/find-charge-by-shop/${shop.id}`}>{labels.view}</Link>
              </Button>
            </TableCell>
            <TableCell className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/shop-balance/${shop.id}`}>{labels.view}</Link>
              </Button>
            </TableCell>
            <TableCell className="text-center">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/admin/edit-shop/${shop.id}`}>{labels.edit}</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
