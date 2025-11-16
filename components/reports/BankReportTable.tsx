"use client";

import { BankReportCategoryData } from "@/app/api/actions/reports/generateBankReport";
import {
  transactionCategoryNames,
  transactionTypeNames,
} from "@/utils/bankCategories";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";

interface BankReportTableProps {
  reportData: BankReportCategoryData[];
  totalIncome: number;
  totalPayments: number;
  netBalance: number;
}

export default function BankReportTable({
  reportData,
  totalIncome,
  totalPayments,
  netBalance,
}: BankReportTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">خلاصه گزارش بانکی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-sm text-gray-600">کل درآمدها</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalPayments)}
              </p>
              <p className="text-sm text-gray-600">کل پرداخت‌ها</p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(netBalance)}
              </p>
              <p className="text-sm text-gray-600">تراز خالص</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.length}
              </p>
              <p className="text-sm text-gray-600">دسته‌بندی‌ها</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            گزارش تراکنش‌های بانکی به تفکیک دسته‌بندی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-right">
                <TableHead className="text-right">دسته‌بندی</TableHead>
                <TableHead className="text-right">درآمدها</TableHead>
                <TableHead className="text-right">پرداخت‌ها</TableHead>
                <TableHead className="text-right">تراز خالص</TableHead>
                <TableHead className="text-right">تعداد تراکنش</TableHead>
                <TableHead className="text-right">جزئیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((categoryData) => {
                const isExpanded = expandedCategories.has(
                  categoryData.category
                );
                const netAmountPercent =
                  totalIncome > 0
                    ? ((categoryData.netAmount / totalIncome) * 100).toFixed(1)
                    : "0";

                return (
                  <>
                    <TableRow
                      key={categoryData.category}
                      className="text-right"
                    >
                      <TableCell className="font-medium">
                        {transactionCategoryNames[categoryData.category]}
                      </TableCell>
                      <TableCell className="font-mono text-green-600">
                        {formatCurrency(categoryData.totalIncome)}
                      </TableCell>
                      <TableCell className="font-mono text-red-600">
                        {formatCurrency(categoryData.totalPayments)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono ${
                              categoryData.netAmount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(categoryData.netAmount)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {netAmountPercent}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {categoryData.transactionCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(categoryData.category)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <div className="bg-gray-50 p-4 rounded-md m-2">
                            {/* Income Transactions */}
                            {categoryData.incomeTransactions.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <h4 className="font-medium text-green-800">
                                    تراکنش‌های درآمدی
                                  </h4>
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="text-right bg-green-50">
                                      <TableHead className="text-right">
                                        تاریخ
                                      </TableHead>
                                      <TableHead className="text-right">
                                        مبلغ
                                      </TableHead>
                                      <TableHead className="text-right">
                                        توضیحات
                                      </TableHead>
                                      <TableHead className="text-right">
                                        شماره حساب
                                      </TableHead>
                                      <TableHead className="text-right">
                                        شماره سند
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {categoryData.incomeTransactions.map(
                                      (transaction) => (
                                        <TableRow
                                          key={transaction.id}
                                          className="text-right"
                                        >
                                          <TableCell>
                                            {formatDate(transaction.date)}
                                          </TableCell>
                                          <TableCell className="font-mono text-green-600">
                                            {formatCurrency(transaction.amount)}
                                          </TableCell>
                                          <TableCell className="max-w-xs truncate">
                                            {transaction.description || "-"}
                                          </TableCell>
                                          <TableCell className="font-mono text-xs">
                                            {transaction.bankAccountNumber}
                                          </TableCell>
                                          <TableCell className="font-mono text-xs">
                                            {transaction.bankReferenceId}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            )}

                            {/* Payment Transactions */}
                            {categoryData.paymentTransactions.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                  <h4 className="font-medium text-red-800">
                                    تراکنش‌های پرداختی
                                  </h4>
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="text-right bg-red-50">
                                      <TableHead className="text-right">
                                        تاریخ
                                      </TableHead>
                                      <TableHead className="text-right">
                                        مبلغ
                                      </TableHead>
                                      <TableHead className="text-right">
                                        توضیحات
                                      </TableHead>
                                      <TableHead className="text-right">
                                        شماره حساب
                                      </TableHead>
                                      <TableHead className="text-right">
                                        شماره سند
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {categoryData.paymentTransactions.map(
                                      (transaction) => (
                                        <TableRow
                                          key={transaction.id}
                                          className="text-right"
                                        >
                                          <TableCell>
                                            {formatDate(transaction.date)}
                                          </TableCell>
                                          <TableCell className="font-mono text-red-600">
                                            {formatCurrency(transaction.amount)}
                                          </TableCell>
                                          <TableCell className="max-w-xs truncate">
                                            {transaction.description || "-"}
                                          </TableCell>
                                          <TableCell className="font-mono text-xs">
                                            {transaction.bankAccountNumber}
                                          </TableCell>
                                          <TableCell className="font-mono text-xs">
                                            {transaction.bankReferenceId}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
