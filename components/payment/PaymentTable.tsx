import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Payment } from "@prisma/client"
import { format } from "date-fns-jalali"

interface PaymentTableProps {
  payments: Payment[]
}

export function PaymentTable({ payments }: PaymentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>Shop Plaque</TableHead>
          <TableHead>Person Name</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.amount.toLocaleString()} Rials</TableCell>
            <TableCell>{payment.plaque}</TableCell>
            <TableCell>{payment.personName}</TableCell>
            <TableCell>{format(new Date(payment.date), 'yyyy/MM/dd')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

