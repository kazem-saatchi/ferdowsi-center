"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";

interface ShopFinancialTableProps {
  data: {
    id: string;
    amount: number;
    date: Date;
    description: string;
    personName: string;
    proprietor: boolean;
    title: string;
    type: "payment" | "charge";
    bankTransactionId: string | null;
  }[];
}

export function ShopFinancialTable({ data }: ShopFinancialTableProps) {
  return (
    <Table className="mt-6">
      <TableCaption>لیست تراکنش‌های مالی واحد تجاری</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">نوع</TableHead>
          <TableHead className="text-center">تاریخ</TableHead>
          <TableHead className="text-center">عنوان</TableHead>
          <TableHead className="text-center">توضیحات</TableHead>
          <TableHead className="text-center">نام شخص</TableHead>
          <TableHead className="text-center">مبلغ</TableHead>
          <TableHead className="text-center">شناسه بانکی</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="text-center">
              {transaction.type === "payment" ? (
                <div className="flex items-center text-green-600">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  پرداخت
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  هزینه
                </div>
              )}
            </TableCell>
            <TableCell className="text-center">
              {new Date(transaction.date).toLocaleDateString("fa-IR")}
            </TableCell>
            <TableCell className="text-center">{transaction.title}</TableCell>
            <TableCell className="text-center max-w-[400px]">
              {transaction.description}
            </TableCell>
            <TableCell className="text-center">
              {transaction.personName}
              {transaction.proprietor && (
                <span className="text-xs text-muted-foreground mr-1">
                  {" "}
                  (مالک)
                </span>
              )}
            </TableCell>
            <TableCell
              className={
                transaction.type === "payment"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {transaction.amount.toLocaleString("fa-IR")} ریال
            </TableCell>
            <TableCell className="text-center">
              {transaction.bankTransactionId ? <Badge>دارد</Badge> : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
