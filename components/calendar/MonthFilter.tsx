"use client";

import DateObject from "react-date-object";
import { X } from "lucide-react";
import JalaliMonthCalendar from "@/components/calendar/JalaliMonthCalendar";
import { Button } from "@/components/ui/button";
import { labels } from "@/utils/label";

/** The [from, to) range of a Jalali month in the browser's time zone: local
 *  midnight on the 1st up to local midnight on the 1st of the next month.
 *  Charges and payments are written from the same pickers at local midnight,
 *  so this catches every row of the month and none of the next. */
export function monthRange(month: DateObject | null): {
  from?: Date;
  to?: Date;
} {
  if (!month) return {};
  // The DateObject methods mutate, so work on copies.
  const start = new DateObject(month)
    .toFirstOfMonth()
    .setHour(0)
    .setMinute(0)
    .setSecond(0)
    .setMillisecond(0);
  const next = new DateObject(start).add(1, "month");
  return { from: start.toDate(), to: next.toDate() };
}

/** A month picker for list filters, with a button to go back to all months. */
export default function MonthFilter({
  value,
  onChange,
  id = "month-filter",
}: {
  value: DateObject | null;
  onChange: (month: DateObject | null) => void;
  id?: string;
}) {
  return (
    <div className="flex items-end gap-1">
      <div className="w-40">
        <JalaliMonthCalendar
          id={id}
          value={value}
          placeholder={labels.anyMonth}
          pickOnOpen={false}
          handleDateChange={(date) => onChange(date ? new DateObject(date) : null)}
        />
      </div>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(null)}
          aria-label={labels.anyMonth}
          title={labels.anyMonth}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
