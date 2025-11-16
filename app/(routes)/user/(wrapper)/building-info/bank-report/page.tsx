"use client";

import React, { useState, useEffect } from "react";
import {
  generateBankReport,
  BankReportResponse,
} from "@/app/api/actions/reports/generateBankReport";
import BankReportTable from "@/components/reports/BankReportTable";
import BankReportFilters from "@/components/reports/BankReportFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Loader2, Banknote } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BankReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<BankReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // Parse initial date parameters from URL
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : null;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : null;

  // Load initial data
  useEffect(() => {
    loadReportData(startDate, endDate);
  }, []);

  const loadReportData = async (start?: Date | null, end?: Date | null) => {
    try {
      setIsLoading(true);
      const data = await generateBankReport(
        start || undefined,
        end || undefined
      );
      setReportData(data);
    } catch (error) {
      console.error("Error loading bank report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = async (
    filterStartDate: Date | null,
    filterEndDate: Date | null
  ) => {
    setIsFiltering(true);

    // Update URL parameters
    const params = new URLSearchParams();
    if (filterStartDate) {
      params.set("startDate", filterStartDate.toISOString());
    }
    if (filterEndDate) {
      params.set("endDate", filterEndDate.toISOString());
    }

    router.push(`?${params.toString()}`);

    // Load filtered data
    await loadReportData(filterStartDate, filterEndDate);
    setIsFiltering(false);
  };

  const handleClearFilter = async () => {
    setIsFiltering(true);

    // Clear URL parameters
    router.push("");

    // Load all data
    await loadReportData(null, null);
    setIsFiltering(false);
  };

  if (isLoading || !reportData) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">در حال بارگذاری گزارش بانکی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Banknote className="h-8 w-8 text-blue-600" />
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">گزارش بانکی</h1>
            <p className="text-gray-600">
              گزارش جامع تراکنش‌های بانکی درآمدها و هزینه‌ها
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>بروزرسانی هفتگی</span>
        </div>
      </div>

      {/* Filters */}
      <BankReportFilters
        onFilter={handleFilter}
        onClear={handleClearFilter}
        isLoading={isFiltering}
      />

      {/* Report Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">اطلاعات گزارش</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            <div>
              <p className="text-sm text-gray-600">آخرین بروزرسانی</p>
              <p className="font-medium">
                {new Intl.DateTimeFormat("fa-IR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date())}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">کل تراکنش‌ها</p>
              <p className="font-medium">{reportData.totalTransactions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">بازه زمانی</p>
              <p className="font-medium">
                {reportData.dateRange
                  ? `${new Intl.DateTimeFormat("fa-IR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(
                      reportData.dateRange.start
                    )} تا ${new Intl.DateTimeFormat("fa-IR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(reportData.dateRange.end)}`
                  : "تمام دوره‌ها"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading overlay for filtering */}
      {isFiltering && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p>در حال اعمال فیلتر...</p>
          </div>
        </div>
      )}

      {/* Bank Report Table */}
      <BankReportTable
        reportData={reportData.categories}
        totalIncome={reportData.totalIncome}
        totalPayments={reportData.totalPayments}
        netBalance={reportData.netBalance}
      />

      {/* Note about ISR */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800 text-right">
            💡 این گزارش به صورت خودکار هر هفته بروزرسانی می‌شود و داده‌های جدید
            بانکی را نمایش می‌دهد. برای فیلتر کردن گزارش بر اساس ماه، از
            فیلترهای ماهانه بالا استفاده کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
