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
import { labels } from "@/utils/label";

interface PersonListProps {
  persons: Person[];
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
          {/* <TableHead className="text-center">{labels.delete}</TableHead> */}
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
              {person.phoneTwo || labels.notAvailable}
            </TableCell>
            <TableCell className="text-center">
              {person.isActive ? labels.active : labels.inactive}
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/update-person/${person.IdNumber}`}>
                <Button variant="secondary">{labels.edit}</Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/history-by-person/${person.id}`}>
                <Button variant="outline">{labels.view}</Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/find-charge-by-person/${person.id}`}>
                <Button variant="outline">{labels.view}</Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/person-balance/${person.id}`}>
                <Button variant="outline">{labels.view}</Button>
              </Link>
            </TableCell>
            {/* <TableCell className="text-center">
              <DeletePerson id={person.id} />
            </TableCell> */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
