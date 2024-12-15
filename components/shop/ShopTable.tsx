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

interface ShopsTableProps {
  shops: Shop[];
}

export function ShopsTable({ shops }: ShopsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Plaque</TableHead>
          <TableHead className="text-center">Area (sq m)</TableHead>
          <TableHead className="text-center">Floor</TableHead>
          <TableHead className="text-center">Owner</TableHead>
          <TableHead className="text-center">Renter</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
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
              {shop.isActive ? "Active" : "Inactive"}
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/edit-shop/${shop.id}`} passHref>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
