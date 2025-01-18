import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Person } from "@prisma/client";
import Link from "next/link";
import { Button } from "../ui/button";
import DeletePerson from "./DeletePerson";

interface PersonListProps {
  persons: Person[];
}

export function PersonList({ persons }: PersonListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">کد ملی</TableHead>
          <TableHead className="text-center">نام</TableHead>
          <TableHead className="text-center">فامیلی</TableHead>
          <TableHead className="text-center">شماره موبایل</TableHead>
          <TableHead className="text-center">شماره موبایل دوم</TableHead>
          <TableHead className="text-center">وضعیت</TableHead>
          <TableHead className="text-center">ویرایش اطلاعات</TableHead>
          <TableHead className="text-center">تاریخچه</TableHead>
          <TableHead className="text-center">شارژها</TableHead>
          <TableHead className="text-center">حذف</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.map((person) => (
          <TableRow key={person.id}>
            <TableCell className="text-center">{person.IdNumber}</TableCell>
            <TableCell className="text-center">{person.firstName}</TableCell>
            <TableCell className="text-center">{person.lastName}</TableCell>
            <TableCell className="text-center">{person.phoneOne}</TableCell>
            <TableCell className="text-center">
              {person.phoneTwo || "N/A"}
            </TableCell>
            <TableCell className="text-center">
              {person.isActive ? "فعال" : "غیر فعال"}
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/update-person/${person.IdNumber}`}>
                <Button variant="secondary">ویرایش</Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/history-by-person/${person.id}`}>
                <Button variant="outline">مشاهده</Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/find-charge-by-person/${person.id}`}>
                <Button variant="outline">مشاهده</Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <DeletePerson id={person.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
