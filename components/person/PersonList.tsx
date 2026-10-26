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
import RowActionsMenu from "@/components/table/RowActionsMenu";
import { labels } from "@/utils/label";

interface PersonListProps {
  persons: SafePerson[];
}

export function PersonList({ persons }: PersonListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell text-center">{labels.nationalId}</TableHead>
          <TableHead className="text-center">{labels.name}</TableHead>
          <TableHead className="text-center">{labels.lastName}</TableHead>
          <TableHead className="text-center">{labels.mobile}</TableHead>
          <TableHead className="hidden md:table-cell text-center">{labels.secondMobile}</TableHead>
          <TableHead className="hidden md:table-cell text-center">{labels.status}</TableHead>
          <TableHead className="text-center">{labels.rowActions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.map((person) => (
          <TableRow key={person.id}>
            <TableCell className="hidden sm:table-cell text-center">{toPersianDigits(person.IdNumber)}</TableCell>
            <TableCell className="text-center">{person.firstName}</TableCell>
            <TableCell className="text-center">{person.lastName}</TableCell>
            <TableCell className="text-center">{toPersianDigits(person.phoneOne)}</TableCell>
            <TableCell className="hidden md:table-cell text-center">
              {person.phoneTwo ? toPersianDigits(person.phoneTwo) : labels.notAvailable}
            </TableCell>
            <TableCell className="hidden md:table-cell text-center">
              {person.isActive ? labels.active : labels.inactive}
            </TableCell>
            <TableCell className="text-center">
              <RowActionsMenu
                rowLabel={`${person.firstName} ${person.lastName}`}
                actions={[
                  { label: labels.histories, href: `/admin/history-by-person/${person.id}` },
                  { label: labels.charges, href: `/admin/find-charge-by-person/${person.id}` },
                  { label: labels.balance, href: `/admin/person-balance/${person.id}` },
                ]}
                edit={{ label: labels.editInfo, href: `/admin/update-person/${person.IdNumber}` }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
