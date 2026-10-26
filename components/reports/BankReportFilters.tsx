"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  /** The month the report opened with, shown in the picker. */
  initialMonth?: DateObject | null;
}

/** The Jalali month before the current one: the latest month the bank data
 *  covers in full, so the report opens on it instead of empty. */
export function lastFullMonth(): DateObject {
  return new DateObject({ calendar: persian, locale: persian_fa })
    .toFirstOfMonth()
    .subtract(1, "month");
}

/** The report window for a Jalali month, as the report query wants it. */
export function bankReportRange(month: DateObject): { start: Date; end: Date } {
  // Create a new DateObject for the first day of the selected Jalali month
  const startDateObj = new DateObject(month);
  startDateObj.setDay(1); // First day of the Jalali month

  // Create a new DateObject for the last day of the selected Jalali month
  const endDateObj = new DateObject(month);
  // Move to next month, then back one day to get last day of current month
  endDateObj.setMonth(endDateObj.month.number + 1);
  endDateObj.setDay(1);
  endDateObj.subtract(1, "day");

  // The bounds have to be UTC, not the picker's local midnight: the stored
  // dates are UTC midnight, so a local bound shifted the whole window by the
  // viewer's offset. See utils/jalaliRange.ts. getBankTransactionsForReport
  // still uses an inclusive `lte`, hence the end-of-day upper bound.
  return {
    start: toUtcDayStart(startDateObj.toDate()),
    end: toUtcDayEnd(endDateObj.toDate()),
  };
}

export default function BankReportFilters({
  onFilter,
  onClear,
  isLoading = false,
  initialMonth = null,
}: BankReportFiltersProps) {
  const [selectedMonth, setSelectedMonth] = useState<DateObject | null>(
    initialMonth
  );

  const handleFilter = () => {
    if (!selectedMonth) return;
    const { start, end } = bankReportRange(selectedMonth);
    onFilter(start, end);
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
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-start flex items-center gap-2">
          <Filter className="h-5 w-5" />
          فیلترهای گزارش بانکی
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Month Selector */}
          <div>
            <JalaliMonthCalendar
              handleDateChange={handleMonthChange}
              value={selectedMonth}
              pickOnOpen={false}
            />
            <p className="text-xs text-muted-foreground text-start mt-1">
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
            <p className="text-sm text-info-foreground text-start">
              نمایش تراکنش‌های ماه {selectedMonth.format("MMMM YYYY")}
            </p>
          </div>
        )}

        {/* Note about month selection */}
        <div className="mt-4 p-3 bg-warning/10 rounded-md">
          <p className="text-xs text-warning-foreground text-start">
            💡 گزارش برای یک ماه کامل تهیه می‌شود. لطفاً ماه مورد نظر خود را
            انتخاب کنید.
          </p>
        </div>
      </CardContent>
    </div>
  );
}
