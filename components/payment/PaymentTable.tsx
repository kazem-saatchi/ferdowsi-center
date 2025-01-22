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
import { Badge } from "../ui/badge";
import ReceiptImage from "./ReceiptImage";
import { labels } from "@/utils/label";

interface PaymentTableProps {
  payments: Payment[];
}

export function PaymentTable({ payments }: PaymentTableProps) {
  const deletePaymentMutation = useDeletePaymentById();

  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string[]>([]);
  const [viewImage, setViewImage] = useState<boolean>(false);
  const [viewImageSrc, setViewImageSrc] = useState<string>("");

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

  const paymentTypeMap = {
    CASH: "نقدی",
    CHEQUE: "چک",
    POS_MACHINE: "کارت خوان",
    BANK_TRANSFER: "کارت به کارت",
    OTHER: "سایر روش‌ها",
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">{labels.amount}</TableHead>
            <TableHead className="text-center">{labels.plaque}</TableHead>
            <TableHead className="text-center">{labels.personName}</TableHead>
            <TableHead className="text-center">{labels.date}</TableHead>
            <TableHead className="text-center">{labels.paymentType}</TableHead>
            <TableHead className="text-center">
              {labels.paymentCategory}
            </TableHead>
            <TableHead className="text-center">{labels.receiptImage}</TableHead>
            <TableHead className="text-center">{labels.delete}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="text-center">
                {payment.amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">{payment.plaque}</TableCell>
              <TableCell className="text-center">
                {payment.personName}
              </TableCell>
              <TableCell className="text-center">
                {format(new Date(payment.date), "yyyy/MM/dd")}
              </TableCell>
              <TableCell className="text-center">
                {paymentTypeMap[payment.type]}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={payment.proprietor ? "secondary" : "default"}>
                  {payment.proprietor
                    ? labels.proprietorCharge
                    : labels.monthlyCharge}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {payment.receiptImageUrl !== "" ? (
                  <Button
                    onClick={() => {
                      setViewImage(true);
                      setViewImageSrc(payment.receiptImageUrl);
                    }}
                  >
                    {labels.viewReceipt}
                  </Button>
                ) : (
                  <Button disabled variant="secondary">
                    {labels.noReceipt}
                  </Button>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  onClick={() => handleDelete(payment.id)}
                  disabled={
                    deleting && deleteId.some((id) => id === payment.id)
                  }
                  variant="destructive"
                >
                  {deleting && deleteId.some((id) => id === payment.id)
                    ? labels.deleting
                    : labels.delete}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {viewImage && viewImageSrc !== "" && (
        <ReceiptImage src={viewImageSrc} viewPage={setViewImage} />
      )}
    </>
  );
}
