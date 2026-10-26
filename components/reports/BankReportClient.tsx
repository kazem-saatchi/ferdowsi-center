"use client";

import React, { useState, useMemo } from "react";
import BankReportTable from "@/components/reports/BankReportTable";
import BankReportFilters, {
  bankReportRange,
  lastFullMonth,
} from "@/components/reports/BankReportFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { useGetBankReportTransactions } from "@/tanstack/query/bankReportQuery";
import { processTransactionsForReport } from "@/utils/bankReportCalculations";
import { formatNumber } from "@/utils/formatNumber";
import { formatJalaliDate, formatJalaliDateTime } from "@/utils/localeDate";
import { fromUtcDay } from "@/utils/jalaliRange";

export default function BankReportClient() {
  // Open on the last full month rather than an empty "pick a month" card.
  const [initialMonth] = useState(lastFullMonth);
  const [startDate, setStartDate] = useState<Date | null>(
    () => bankReportRange(initialMonth).start
  );
  const [endDate, setEndDate] = useState<Date | null>(
    () => bankReportRange(initialMonth).end
  );

  // Fetch transactions using TanStack Query
  const {
    data: transactions,
    isLoading,
    isError,
    error,
  } = useGetBankReportTransactions({
    startDate,
    endDate,
    enabled: !!startDate && !!endDate,
  });

  // Calculate report data on client side
  const reportData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }
    return processTransactionsForReport(transactions);
  }, [transactions]);

  const handleFilter = (
    filterStartDate: Date | null,
    filterEndDate: Date | null
  ) => {
    setStartDate(filterStartDate);
    setEndDate(filterEndDate);
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <>
      {/* Filters */}
      <BankReportFilters
        onFilter={handleFilter}
        onClear={handleClearFilter}
        isLoading={isLoading}
        initialMonth={initialMonth}
      />

      {/* Show initial message when no month is selected */}
      {!startDate || !endDate ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              لطفاً یک ماه را انتخاب کنید
            </h3>
            <p className="text-sm text-muted-foreground">
              برای مشاهده گزارش بانکی، ابتدا ماه مورد نظر خود را از فیلتر بالا
              انتخاب کنید
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Report Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-start">اطلاعات گزارش</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-start">
                <div>
                  <p className="text-sm text-muted-foreground">
                    آخرین بروزرسانی
                  </p>
                  <p className="font-medium">
                    {formatJalaliDateTime(new Date())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل تراکنش‌ها</p>
                  <p className="font-medium">
                    {formatNumber(reportData?.totalTransactions || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">بازه زمانی</p>
                  <p className="font-medium">
                    {startDate && endDate
                      ? `${formatJalaliDate(fromUtcDay(startDate))} تا ${formatJalaliDate(fromUtcDay(endDate))}`
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-info mx-auto mb-4" />
                <p className="text-muted-foreground">
                  در حال دریافت اطلاعات...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {isError && (
            <Card className="border-error">
              <CardContent className="py-12 text-center">
                <p className="text-error font-semibold mb-2">
                  خطا در دریافت اطلاعات
                </p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : "خطای ناشناخته"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Bank Report Table */}
          {!isLoading && !isError && reportData && (
            <>
              <BankReportTable
                reportData={reportData.categories}
                totalIncome={reportData.totalIncome}
                totalPayments={reportData.totalPayments}
                netBalance={reportData.netBalance}
              />

              {/* Note about caching */}
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200 text-start">
                    💡 این گزارش با استفاده از کش مرورگر بهینه‌سازی شده است.
                    اطلاعات هر ماه پس از اولین بار بارگذاری، در کش ذخیره می‌شود
                    تا دسترسی سریع‌تر به اطلاعات امکان‌پذیر باشد.
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {/* No Data State */}
          {!isLoading &&
            !isError &&
            transactions &&
            transactions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    هیچ تراکنشی در این بازه زمانی یافت نشد
                  </p>
                </CardContent>
              </Card>
            )}
        </>
      )}
    </>
  );
}
