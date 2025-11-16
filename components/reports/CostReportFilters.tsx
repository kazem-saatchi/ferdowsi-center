"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import { Filter, RotateCcw } from "lucide-react";

interface CostReportFiltersProps {
  onFilter: (startDate: Date | null, endDate: Date | null) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export default function CostReportFilters({
  onFilter,
  onClear,
  isLoading = false,
}: CostReportFiltersProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleFilter = () => {
    onFilter(startDate, endDate);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onClear();
  };

  const canFilter = startDate && endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <Filter className="h-5 w-5" />
          فیلترهای گزارش
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Start Date */}
          <JalaliDayCalendar
            date={startDate}
            setDate={setStartDate}
            title="تاریخ شروع"
          />

          {/* End Date */}
          <JalaliDayCalendar
            date={endDate}
            setDate={setEndDate}
            title="تاریخ پایان"
          />

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
        {(startDate || endDate) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800 text-right">
              {startDate && endDate
                ? `نمایش هزینه‌های از ${new Intl.DateTimeFormat("fa-IR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(startDate)} تا ${new Intl.DateTimeFormat("fa-IR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(endDate)}`
                : startDate
                ? `نمایش هزینه‌های از ${new Intl.DateTimeFormat("fa-IR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(startDate)} به بعد`
                : `نمایش هزینه‌های تا ${new Intl.DateTimeFormat("fa-IR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(endDate!)}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
