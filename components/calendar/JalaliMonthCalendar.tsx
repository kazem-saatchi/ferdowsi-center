"use client";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Label } from "../ui/label";
import DateObject from "react-date-object";
import CalendarInput from "./CalendarInput";

interface CalendarProps {
  handleDateChange: (date: DateObject) => void;
  value?: DateObject | null;
  id?: string;
  title?: string;
  placeholder?: string;
  /** The picker selects the current month as soon as it opens unless this is
   *  false. A filter wants false, so opening it changes nothing by itself. */
  pickOnOpen?: boolean;
}

function JalaliMonthCalendar({
  handleDateChange,
  value,
  id = "MonthPicker",
  title = "ماه",
  placeholder,
  pickOnOpen = true,
}: CalendarProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{title}</Label>
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        onlyMonthPicker
        onChange={handleDateChange}
        value={value}
        onOpenPickNewDate={pickOnOpen}
        render={<CalendarInput id={id} placeholder={placeholder} />}
        format="MMMM YYYY"
      />
    </div>
  );
}

export default JalaliMonthCalendar;
