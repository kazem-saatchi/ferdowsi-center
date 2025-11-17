"use client";

import { BankTransactionData } from "@/app/api/actions/reports/getBankTransactionsForReport";
import { BankReportCategoryData } from "@/utils/bankReportCalculations";
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
import { ChevronDown, ChevronRight, X } from "lucide-react";
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
  const [selectedTransaction, setSelectedTransaction] =
    useState<BankTransactionData | null>(null);

  const toggleCategory = (category: string, type: "INCOME" | "PAYMENT") => {
    const key = `${type}-${category}`;
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCategories(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " ریال";
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

  // Split data into income and payment categories
  const incomeCategories = reportData.filter((cat) => cat.type === "INCOME");
  const paymentCategories = reportData.filter((cat) => cat.type === "PAYMENT");

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">خلاصه گزارش بانکی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-sm text-muted-foreground">کل درآمدها</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-error">
                {formatCurrency(totalPayments)}
              </p>
              <p className="text-sm text-muted-foreground">کل پرداخت‌ها</p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-success" : "text-error"
                }`}
              >
                {formatCurrency(netBalance)}
              </p>
              <p className="text-sm text-muted-foreground">تراز خالص</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Categories Table */}
      {incomeCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right text-success">
              دسته‌بندی‌های درآمدی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">دسته‌بندی</TableHead>
                  <TableHead className="text-right">مبلغ کل</TableHead>
                  <TableHead className="text-right">تعداد تراکنش</TableHead>
                  <TableHead className="text-right">جزئیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeCategories.map((categoryData) => {
                  const isExpanded = expandedCategories.has(
                    `${categoryData.type}-${categoryData.category}`
                  );

                  return (
                    <>
                      <TableRow
                        key={`${categoryData.type}-${categoryData.category}`}
                        className="text-right"
                      >
                        <TableCell className="font-medium">
                          {transactionCategoryNames[categoryData.category]}
                        </TableCell>
                        <TableCell className="font-mono text-success">
                          {formatCurrency(categoryData.totalAmount)}
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
                            onClick={() =>
                              toggleCategory(
                                categoryData.category,
                                categoryData.type
                              )
                            }
                            disabled={categoryData.transactionCount === 0}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && categoryData.transactionCount > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="p-0">
                            <div className="bg-success/10 p-4 rounded-md m-2">
                              <Table>
                                <TableHeader>
                                  <TableRow className="text-right">
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
                                  {categoryData.transactions.map(
                                    (transaction) => (
                                      <TableRow
                                        key={transaction.id}
                                        className="text-right cursor-pointer hover:bg-success/5"
                                        onClick={() =>
                                          setSelectedTransaction(transaction)
                                        }
                                      >
                                        <TableCell>
                                          {formatDate(transaction.date)}
                                        </TableCell>
                                        <TableCell className="font-mono text-success">
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
      )}

      {/* Payment Categories Table */}
      {paymentCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right text-error">
              دسته‌بندی‌های پرداختی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">دسته‌بندی</TableHead>
                  <TableHead className="text-right">مبلغ کل</TableHead>
                  <TableHead className="text-right">تعداد تراکنش</TableHead>
                  <TableHead className="text-right">جزئیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentCategories.map((categoryData) => {
                  const isExpanded = expandedCategories.has(
                    `${categoryData.type}-${categoryData.category}`
                  );

                  return (
                    <>
                      <TableRow
                        key={`${categoryData.type}-${categoryData.category}`}
                        className="text-right"
                      >
                        <TableCell className="font-medium">
                          {transactionCategoryNames[categoryData.category]}
                        </TableCell>
                        <TableCell className="font-mono text-error">
                          {formatCurrency(categoryData.totalAmount)}
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
                            onClick={() =>
                              toggleCategory(
                                categoryData.category,
                                categoryData.type
                              )
                            }
                            disabled={categoryData.transactionCount === 0}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && categoryData.transactionCount > 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="p-0">
                            <div className="bg-error/10 p-4 rounded-md m-2">
                              <Table>
                                <TableHeader>
                                  <TableRow className="text-right">
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
                                  {categoryData.transactions.map(
                                    (transaction) => (
                                      <TableRow
                                        key={transaction.id}
                                        className="text-right cursor-pointer hover:bg-error/5"
                                        onClick={() =>
                                          setSelectedTransaction(transaction)
                                        }
                                      >
                                        <TableCell>
                                          {formatDate(transaction.date)}
                                        </TableCell>
                                        <TableCell className="font-mono text-error">
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
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-right">جزئیات تراکنش</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTransaction(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction Type */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    نوع تراکنش
                  </p>
                  <Badge
                    variant={
                      selectedTransaction.type === "INCOME"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {transactionTypeNames[selectedTransaction.type]}
                  </Badge>
                </div>

                {/* Category */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    دسته‌بندی
                  </p>
                  <p className="font-medium">
                    {selectedTransaction.category
                      ? transactionCategoryNames[selectedTransaction.category]
                      : "دسته‌بندی نشده"}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">مبلغ</p>
                  <p
                    className={`font-bold text-lg ${
                      selectedTransaction.type === "INCOME"
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>

                {/* Balance */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">موجودی</p>
                  <p className="font-mono">
                    {formatCurrency(selectedTransaction.balance)}
                  </p>
                </div>

                {/* Date */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">تاریخ</p>
                  <p className="font-medium">
                    {formatDate(selectedTransaction.date)}
                  </p>
                </div>

                {/* Bank Account Number */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    شماره حساب
                  </p>
                  <p className="font-mono text-sm">
                    {selectedTransaction.bankAccountNumber}
                  </p>
                </div>

                {/* Account Type */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">نوع حساب</p>
                  <p className="font-medium">
                    {selectedTransaction.accountType}
                  </p>
                </div>

                {/* Bank Reference ID */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    شماره مرجع بانک
                  </p>
                  <p className="font-mono text-sm">
                    {selectedTransaction.bankReferenceId}
                  </p>
                </div>

                {/* Bank Receipt ID */}
                {selectedTransaction.bankRecieptId && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      شماره رسید بانک
                    </p>
                    <p className="font-mono text-sm">
                      {selectedTransaction.bankRecieptId}
                    </p>
                  </div>
                )}

                {/* Cheque Number */}
                {selectedTransaction.chequeNumber && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      شماره چک
                    </p>
                    <p className="font-mono text-sm">
                      {selectedTransaction.chequeNumber}
                    </p>
                  </div>
                )}

                {/* Branch */}
                {selectedTransaction.branch && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">شعبه</p>
                    <p className="font-medium">{selectedTransaction.branch}</p>
                  </div>
                )}

                {/* Receiver Account */}
                {selectedTransaction.recieverAccount && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      حساب گیرنده
                    </p>
                    <p className="font-mono text-sm">
                      {selectedTransaction.recieverAccount}
                    </p>
                  </div>
                )}

                {/* Sender Account */}
                {selectedTransaction.senderAccount && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      حساب فرستنده
                    </p>
                    <p className="font-mono text-sm">
                      {selectedTransaction.senderAccount}
                    </p>
                  </div>
                )}
              </div>

              {/* Description - Full width */}
              <div className="text-right border-t pt-4">
                <p className="text-sm text-muted-foreground mb-1">توضیحات</p>
                <p className="font-medium whitespace-pre-wrap">
                  {selectedTransaction.description || "توضیحات ندارد"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
