import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PersonBalanceByShopData } from "@/schema/balanceSchema";
import { labels } from "@/utils/label";

interface PersonBalanceProps {
  personsBalance: PersonBalanceByShopData[];
}

function PersonsBalanceTable({ personsBalance }: PersonBalanceProps) {
  return (
    <>
      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {personsBalance?.map((person) => (
          <Card key={person.personId}>
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold">{person.personName}</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {labels.totalCharge}
                  </span>
                  <span className="break-all">
                    {person.totalCharge.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {labels.totalPayment}
                  </span>
                  <span className="break-all">
                    {person.totalPayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-t pt-2">
                  <span className="font-medium">{labels.totalBalance}</span>
                  <span className="font-bold break-all">
                    {person.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">{labels.personName}</TableHead>
              <TableHead className="text-center">{labels.totalCharge}</TableHead>
              <TableHead className="text-center">
                {labels.totalPayment}
              </TableHead>
              <TableHead className="text-center">
                {labels.totalBalance}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personsBalance &&
              personsBalance.map((person) => (
                <TableRow key={person.personId}>
                  <TableCell className="text-center">
                    {person.personName}
                  </TableCell>
                  <TableCell className="text-center">
                    {person.totalCharge.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {person.totalPayment.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {person.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default PersonsBalanceTable;
