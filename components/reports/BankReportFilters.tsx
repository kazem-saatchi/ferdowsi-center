"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JalaliMonthCalendar from "@/components/calendar/JalaliMonthCalendar";
import { Filter, RotateCcw } from "lucide-react";
import DateObject from "react-date-object";

interface BankReportFiltersProps {
  onFilter: (startDate: Date | null, endDate: Date | null) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export default function BankReportFilters({
  onFilter,
  onClear,
  isLoading = false,
}: BankReportFiltersProps) {
  const [startMonth, setStartMonth] = useState<DateObject | null>(null);
  const [endMonth, setEndMonth] = useState<DateObject | null>(null);

  const handleFilter = () => {
    if (!startMonth || !endMonth) return;

    // Convert DateObject to Date and get start/end of months
    const startDate = startMonth.toDate();
    startDate.setDate(1); // First day of month
    startDate.setHours(0, 0, 0, 0);

    const endDate = endMonth.toDate();
    endDate.setMonth(endDate.getMonth() + 1, 0); // Last day of month
    endDate.setHours(23, 59, 59, 999);

    onFilter(startDate, endDate);
  };

  const handleClear = () => {
    setStartMonth(null);
    setEndMonth(null);
    onClear();
  };

  const canFilter = startMonth && endMonth;

  const handleStartMonthChange = (date: DateObject) => {
    setStartMonth(date);
  };

  const handleEndMonthChange = (date: DateObject) => {
    setEndMonth(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <Filter className="h-5 w-5" />
          فیلترهای گزارش بانکی
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Start Month */}
          <div>
            <JalaliMonthCalendar handleDateChange={handleStartMonthChange} />
            <p className="text-xs text-gray-500 text-right mt-1">
              ماه شروع گزارش
            </p>
          </div>

          {/* End Month */}
          <div>
            <JalaliMonthCalendar handleDateChange={handleEndMonthChange} />
            <p className="text-xs text-gray-500 text-right mt-1">
              ماه پایان گزارش
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleFilter}
              disabled={!canFilter || isLoading}
              className="flex-1"
            >
              {isLoading ? "در حال بارگذاری..." : "اعمال فیلتر"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              پاک کردن فیلتر
            </Button>
          </div>
        </div>

        {/* Filter Status */}
        {(startMonth || endMonth) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800 text-right">
              {startMonth && endMonth
                ? `نمایش تراکنش‌های از ${startMonth.format(
                    "MMMM YYYY"
                  )} تا ${endMonth.format("MMMM YYYY")}`
                : startMonth
                ? `نمایش تراکنش‌های از ${startMonth.format("MMMM YYYY")} به بعد`
                : `نمایش تراکنش‌های تا ${endMonth?.format("MMMM YYYY")}`}
            </p>
          </div>
        )}

        {/* Note about month selection */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-xs text-yellow-800 text-right">
            💡 این فیلتر بر اساس ماه کامل عمل می‌کند. برای مشاهده تراکنش‌های یک
            ماه کامل، ماه شروع و پایان را انتخاب کنید.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
