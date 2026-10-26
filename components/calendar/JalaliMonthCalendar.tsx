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
}

function JalaliMonthCalendar({
  handleDateChange,
  value,
  id = "MonthPicker",
  title = "ماه",
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
        render={<CalendarInput id={id} />}
        format="MMMM YYYY"
      />
    </div>
  );
}

export default JalaliMonthCalendar;
