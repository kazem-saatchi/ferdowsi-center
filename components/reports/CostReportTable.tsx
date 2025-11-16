"use client";

import { CostReportData } from "@/app/api/actions/reports/generateCostsReport";
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
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { categoryNames } from "@/utils/costCategories";

interface CostReportTableProps {
  reportData: CostReportData[];
  totalAmount: number;
}

export default function CostReportTable({
  reportData,
  totalAmount,
}: CostReportTableProps) {
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
          <CardTitle className="text-right">خلاصه گزارش هزینه‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.length}
              </p>
              <p className="text-sm text-gray-600">دسته‌بندی هزینه</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {reportData.reduce((sum, cat) => sum + cat.costCount, 0)}
              </p>
              <p className="text-sm text-gray-600">کل هزینه‌ها</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-sm text-gray-600">مجموع مبلغ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            گزارش هزینه‌ها به تفکیک دسته‌بندی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-right">
                <TableHead className="text-right">دسته‌بندی</TableHead>
                <TableHead className="text-right">تعداد هزینه</TableHead>
                <TableHead className="text-right">مجموع مبلغ</TableHead>
                <TableHead className="text-right">درصد از کل</TableHead>
                <TableHead className="text-right">جزئیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((categoryData) => {
                const isExpanded = expandedCategories.has(
                  categoryData.category
                );
                const percentage =
                  totalAmount > 0
                    ? ((categoryData.totalAmount / totalAmount) * 100).toFixed(
                        1
                      )
                    : "0";

                return (
                  <>
                    <TableRow
                      key={categoryData.category}
                      className="text-right"
                    >
                      <TableCell className="font-medium">
                        {categoryNames[categoryData.category]}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {categoryData.costCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(categoryData.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{percentage}%</Badge>
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
                        <TableCell colSpan={5} className="p-0">
                          <div className="bg-gray-50 p-4 rounded-md m-2">
                            <Table>
                              <TableHeader>
                                <TableRow className="text-right bg-white">
                                  <TableHead className="text-right">
                                    عنوان
                                  </TableHead>
                                  <TableHead className="text-right">
                                    مبلغ
                                  </TableHead>
                                  <TableHead className="text-right">
                                    تاریخ
                                  </TableHead>
                                  <TableHead className="text-right">
                                    توضیحات
                                  </TableHead>
                                  <TableHead className="text-right">
                                    مالکانه
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {categoryData.costs.map((cost) => (
                                  <TableRow
                                    key={cost.id}
                                    className="text-right"
                                  >
                                    <TableCell className="font-medium">
                                      {cost.title}
                                    </TableCell>
                                    <TableCell className="font-mono">
                                      {formatCurrency(cost.amount)}
                                    </TableCell>
                                    <TableCell>
                                      {formatDate(cost.date)}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                      {cost.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          cost.proprietor
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {cost.proprietor ? "بله" : "خیر"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
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
    </div>
  );
}
