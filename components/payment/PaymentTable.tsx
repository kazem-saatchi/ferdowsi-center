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
            <TableHead className="text-center">مبلغ - ریال</TableHead>
            <TableHead className="text-center">پلاک</TableHead>
            <TableHead className="text-center">نام</TableHead>
            <TableHead className="text-center">تاریخ</TableHead>
            <TableHead className="text-center">نحوه پرداخت</TableHead>
            <TableHead className="text-center">مالکانه / ماهانه</TableHead>
            <TableHead className="text-center">تصویر رسید</TableHead>
            <TableHead className="text-center">حذف</TableHead>
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
                  {payment.proprietor ? "مالکانه" : "ماهانه"}
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
                    مشاهده رسید
                  </Button>
                ) : (
                  <Button disabled variant="secondary">
                    رسید ندارد
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
                    ? "..."
                    : "حذف"}
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

