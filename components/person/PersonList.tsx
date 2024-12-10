import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Person } from "@prisma/client"

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
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.map((person) => (
          <TableRow key={person.id}>
            <TableCell>{person.IdNumber}</TableCell>
            <TableCell>{person.firstName}</TableCell>
            <TableCell>{person.LastName}</TableCell>
            <TableCell>{person.phoneOne}</TableCell>
            <TableCell>{person.phoneTwo || 'N/A'}</TableCell>
            <TableCell>{person.isActive ? 'Active' : 'Inactive'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

