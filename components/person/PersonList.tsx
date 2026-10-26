import { toPersianDigits } from "@/utils/formatNumber";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SafePerson } from "@/schema/personSchema";
import Link from "next/link";
import { Button } from "../ui/button";
import { labels } from "@/utils/label";

interface PersonListProps {
  persons: SafePerson[];
}

export function PersonList({ persons }: PersonListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.nationalId}</TableHead>
          <TableHead className="text-center">{labels.name}</TableHead>
          <TableHead className="text-center">{labels.lastName}</TableHead>
          <TableHead className="text-center">{labels.mobile}</TableHead>
          <TableHead className="text-center">{labels.secondMobile}</TableHead>
          <TableHead className="text-center">{labels.status}</TableHead>
          <TableHead className="text-center">{labels.editInfo}</TableHead>
          <TableHead className="text-center">{labels.histories}</TableHead>
          <TableHead className="text-center">{labels.charges}</TableHead>
          <TableHead className="text-center">{labels.balance}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.map((person) => (
          <TableRow key={person.id}>
            <TableCell className="text-center">{toPersianDigits(person.IdNumber)}</TableCell>
            <TableCell className="text-center">{person.firstName}</TableCell>
            <TableCell className="text-center">{person.lastName}</TableCell>
            <TableCell className="text-center">{toPersianDigits(person.phoneOne)}</TableCell>
            <TableCell className="text-center">
              {person.phoneTwo ? toPersianDigits(person.phoneTwo) : labels.notAvailable}
            </TableCell>
            <TableCell className="text-center">
              {person.isActive ? labels.active : labels.inactive}
            </TableCell>
            <TableCell className="text-center">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/admin/update-person/${person.IdNumber}`}>{labels.edit}</Link>
              </Button>
            </TableCell>
            <TableCell className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/history-by-person/${person.id}`}>{labels.view}</Link>
              </Button>
            </TableCell>
            <TableCell className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/find-charge-by-person/${person.id}`}>{labels.view}</Link>
              </Button>
            </TableCell>
            <TableCell className="text-center">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/person-balance/${person.id}`}>{labels.view}</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
