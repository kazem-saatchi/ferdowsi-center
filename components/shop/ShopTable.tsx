import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shop, ShopType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { labels } from "@/utils/label"

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
          <TableHead className="text-center">{labels.storeOrOffice}</TableHead>
          <TableHead className="text-center">{labels.histories}</TableHead>
          <TableHead className="text-center">{labels.charges}</TableHead>
          <TableHead className="text-center">{labels.balance}</TableHead>
          <TableHead className="text-center">{labels.edit}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shops.map((shop) => (
          <TableRow key={shop.id}>
            <TableCell className="text-center">{shop.plaque}</TableCell>
            <TableCell className="text-center">{shop.area}</TableCell>
            <TableCell className="text-center">{shop.floor}</TableCell>
            <TableCell className="text-center">{shop.ownerName}</TableCell>
            <TableCell className="text-center">
              {shop.renterName || "N/A"}
            </TableCell>
            <TableCell className="text-center">
              {shop.isActive ? labels.active : labels.inactive}
            </TableCell>
            <TableCell className="text-center">
              {shop.type === "STORE" && labels.store}
              {shop.type === "OFFICE" && labels.office}
              {shop.type === "KIOSK" && labels.kiosk}
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/history-by-shop/${shop.id}`} passHref>
                <Button variant="secondary" size="sm">
                  {labels.view}
                </Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/find-charge-by-shop/${shop.id}`} passHref>
                <Button variant="secondary" size="sm">
                   {labels.view}
                </Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/shop-balance/${shop.id}`} passHref>
                <Button variant="secondary" size="sm">
                   {labels.view}
                </Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/edit-shop/${shop.id}`} passHref>
                <Button variant="outline" size="sm">
                {labels.edit}
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
