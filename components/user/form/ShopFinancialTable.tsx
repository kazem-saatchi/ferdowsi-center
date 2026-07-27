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
import { Card, CardContent } from "@/components/ui/card";
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
    <>
      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden mt-4">
        {data.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                {transaction.type === "payment" ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <ArrowDown className="h-4 w-4" />
                    پرداخت
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <ArrowUp className="h-4 w-4" />
                    هزینه
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString("fa-IR")}
                </span>
              </div>

              <p className="font-semibold text-sm">{transaction.title}</p>

              {transaction.description ? (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {transaction.description}
                </p>
              ) : null}

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs text-muted-foreground">
                  {transaction.personName}
                  {transaction.proprietor ? " (مالک)" : ""}
                </span>
                <span
                  className={`font-bold text-sm break-all ${
                    transaction.type === "payment"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.amount.toLocaleString("fa-IR")} ریال
                </span>
              </div>

              {transaction.bankTransactionId ? (
                <Badge className="mt-1">شناسه بانکی دارد</Badge>
              ) : null}
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">
            تراکنشی یافت نشد
          </p>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
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
                    <div className="flex items-center justify-center text-green-600">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      پرداخت
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-red-600">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      هزینه
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {new Date(transaction.date).toLocaleDateString("fa-IR")}
                </TableCell>
                <TableCell className="text-center">
                  {transaction.title}
                </TableCell>
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
                      ? "text-green-600 text-center"
                      : "text-red-600 text-center"
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
      </div>
    </>
  );
}
