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

interface PersonListProps {
  persons: Person[];
}

export function PersonList({ persons }: PersonListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Number</TableHead>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Primary Phone</TableHead>
          <TableHead>Secondary Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Edit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.map((person) => (
          <TableRow key={person.id}>
            <TableCell>{person.IdNumber}</TableCell>
            <TableCell>{person.firstName}</TableCell>
            <TableCell>{person.LastName}</TableCell>
            <TableCell>{person.phoneOne}</TableCell>
            <TableCell>{person.phoneTwo || "N/A"}</TableCell>
            <TableCell>{person.isActive ? "Active" : "Inactive"}</TableCell>
            <TableCell>
              <Link href={`/admin/update-person/${person.IdNumber}`}>
                <Button variant="secondary">edit</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
