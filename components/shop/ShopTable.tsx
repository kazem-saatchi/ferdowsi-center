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
          <TableHead className="text-center">پلاک</TableHead>
          <TableHead className="text-center">مساحت (متر مربع)</TableHead>
          <TableHead className="text-center">طبقه</TableHead>
          <TableHead className="text-center">مالک</TableHead>
          <TableHead className="text-center">مستاجر</TableHead>
          <TableHead className="text-center">وضعیت</TableHead>
          <TableHead className="text-center">تجاری / اداری</TableHead>
          <TableHead className="text-center">تاریخچه</TableHead>
          <TableHead className="text-center">شارژها</TableHead>
          <TableHead className="text-center">مانده حساب</TableHead>
          <TableHead className="text-center">ویرایش</TableHead>
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
              {shop.isActive ? "فعال" : "غیرفعال"}
            </TableCell>
            <TableCell className="text-center">
              {shop.type === "STORE" ? "تجاری" : "اداری"}
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/history-by-shop/${shop.id}`} passHref>
                <Button variant="secondary" size="sm">
                  مشاهده
                </Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/find-charge-by-shop/${shop.id}`} passHref>
                <Button variant="secondary" size="sm">
                  مشاهده
                </Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/shop-balance/${shop.id}`} passHref>
                <Button variant="secondary" size="sm">
                  مشاهده
                </Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/edit-shop/${shop.id}`} passHref>
                <Button variant="outline" size="sm">
                  ویرایش
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
