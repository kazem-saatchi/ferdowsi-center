import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeletePaymentById } from "@/tanstack/mutations";
import { Payment } from "@prisma/client";
import { format } from "date-fns-jalali";
import { Button } from "../ui/button";
import { useState } from "react";

interface PaymentTableProps {
  payments: Payment[];
}

export function PaymentTable({ payments }: PaymentTableProps) {
  const deletePaymentMutation = useDeletePaymentById();

  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string[]>([]);

  const handleDelete = async (paymentId: string) => {
    setDeleting(true);
    setDeleteId((prev) => [...prev, paymentId]);
    deletePaymentMutation.mutate(paymentId, {
      onSettled: () => {
        setDeleting(false);
        setDeleteId((prev) => prev.filter((id) => id !== paymentId));
      },
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Amount</TableHead>
          <TableHead className="text-center">Shop Plaque</TableHead>
          <TableHead className="text-center">Person Name</TableHead>
          <TableHead className="text-center">Date</TableHead>
          <TableHead className="text-center">Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="text-center">
              {payment.amount.toLocaleString()} Rials
            </TableCell>
            <TableCell className="text-center">{payment.plaque}</TableCell>
            <TableCell className="text-center">{payment.personName}</TableCell>
            <TableCell className="text-center">
              {format(new Date(payment.date), "yyyy/MM/dd")}
            </TableCell>
            <TableCell className="text-center">
              <Button
                onClick={() => handleDelete(payment.id)}
                disabled={deleting && deleteId.some((id) => id === payment.id)}
                variant="destructive"
              >
                {deleting && deleteId.some((id) => id === payment.id)
                  ? "..."
                  : "Delete"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
