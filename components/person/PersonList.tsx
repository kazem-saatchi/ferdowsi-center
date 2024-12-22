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
          <TableHead className="text-center">ID Number</TableHead>
          <TableHead className="text-center">First Name</TableHead>
          <TableHead className="text-center">Last Name</TableHead>
          <TableHead className="text-center">Primary Phone</TableHead>
          <TableHead className="text-center">Secondary Phone</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Action</TableHead>
          <TableHead className="text-center">History</TableHead>
          <TableHead className="text-center">Delete</TableHead>
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
              {person.isActive ? "Active" : "Inactive"}
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/update-person/${person.IdNumber}`}>
                <Button variant="secondary">edit</Button>
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <Link href={`/admin/history-by-person/${person.id}`}>
                <Button variant="outline">History</Button>
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
