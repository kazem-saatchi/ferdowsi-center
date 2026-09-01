"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JalaliMonthCalendar from "@/components/calendar/JalaliMonthCalendar";
import { Filter, RotateCcw } from "lucide-react";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toUtcDayEnd, toUtcDayStart } from "@/utils/jalaliRange";

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
  const [selectedMonth, setSelectedMonth] = useState<DateObject | null>(null);

  const handleFilter = () => {
    if (!selectedMonth) return;

    // Create a new DateObject for the first day of the selected Jalali month
    const startDateObj = new DateObject(selectedMonth);
    startDateObj.setDay(1); // First day of the Jalali month

    // Create a new DateObject for the last day of the selected Jalali month
    const endDateObj = new DateObject(selectedMonth);
    // Move to next month, then back one day to get last day of current month
    endDateObj.setMonth(endDateObj.month.number + 1);
    endDateObj.setDay(1);
    endDateObj.subtract(1, "day");

    // The bounds have to be UTC, not the picker's local midnight: the stored
    // dates are UTC midnight, so a local bound shifted the whole window by the
    // viewer's offset. See utils/jalaliRange.ts. getBankTransactionsForReport
    // still uses an inclusive `lte`, hence the end-of-day upper bound.
    onFilter(toUtcDayStart(startDateObj.toDate()), toUtcDayEnd(endDateObj.toDate()));
  };

  const handleClear = () => {
    setSelectedMonth(null);
    onClear();
  };

  const canFilter = selectedMonth !== null;

  const handleMonthChange = (date: DateObject) => {
    setSelectedMonth(date);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Month Selector */}
          <div>
            <JalaliMonthCalendar
              handleDateChange={handleMonthChange}
              value={selectedMonth}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              انتخاب ماه مورد نظر
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:justify-end">
            <Button
              onClick={handleFilter}
              disabled={!canFilter || isLoading}
              className="w-full h-11"
            >
              {isLoading ? "در حال بارگذاری..." : "اعمال فیلتر"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full h-11"
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              پاک کردن فیلتر
            </Button>
          </div>
        </div>

        {/* Filter Status */}
        {selectedMonth && (
          <div className="mt-4 p-3 bg-info/10 rounded-md">
            <p className="text-sm text-info-foreground text-right">
              نمایش تراکنش‌های ماه {selectedMonth.format("MMMM YYYY")}
            </p>
          </div>
        )}

        {/* Note about month selection */}
        <div className="mt-4 p-3 bg-warning/10 rounded-md">
          <p className="text-xs text-warning-foreground text-right">
            💡 گزارش برای یک ماه کامل تهیه می‌شود. لطفاً ماه مورد نظر خود را
            انتخاب کنید.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
