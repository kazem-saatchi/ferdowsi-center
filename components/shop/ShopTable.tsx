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
import RowActionsMenu from "@/components/table/RowActionsMenu";
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
          <TableHead className="hidden md:table-cell text-center">{labels.areaM2}</TableHead>
          <TableHead className="text-center">{labels.floorNumber}</TableHead>
          <TableHead className="text-center">{labels.ownerName}</TableHead>
          <TableHead className="text-center">{labels.renterName}</TableHead>
          <TableHead className="hidden md:table-cell text-center">{labels.status}</TableHead>
          <TableHead className="text-center">{labels.type}</TableHead>
          <TableHead className="text-center">{labels.rowActions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shops.map((shop) => (
          <TableRow key={shop.id}>
            <TableCell className="text-center">{toPersianDigits(shop.plaque)}</TableCell>
            <TableCell className="hidden md:table-cell text-center">{toPersianDigits(shop.area)}</TableCell>
            <TableCell className="text-center">{toPersianDigits(shop.floor)}</TableCell>
            <TableCell className="text-center">{shop.ownerName}</TableCell>
            <TableCell className="text-center">
              {shop.renterName || labels.noValue}
            </TableCell>
            <TableCell className="hidden md:table-cell text-center">
              {shop.isActive ? labels.active : labels.inactive}
            </TableCell>
            <TableCell className="text-center">
              {shopTypeLabel(shop.type)}
            </TableCell>
            <TableCell className="text-center">
              <RowActionsMenu
                rowLabel={`${labels.unit} ${toPersianDigits(shop.plaque)}`}
                actions={[
                  { label: labels.histories, href: `/admin/history-by-shop/${shop.id}` },
                  { label: labels.charges, href: `/admin/find-charge-by-shop/${shop.id}` },
                  { label: labels.balance, href: `/admin/shop-balance/${shop.id}` },
                ]}
                edit={{ label: labels.edit, href: `/admin/edit-shop/${shop.id}` }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
