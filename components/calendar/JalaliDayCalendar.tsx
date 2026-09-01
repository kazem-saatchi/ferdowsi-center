"use client";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Dispatch, SetStateAction } from "react";

interface CalendarProps {
  date: Date | null;
  setDate: Dispatch<SetStateAction<Date | null>>;
  title: string;
  disabled?: boolean;
  /**
   * DOM id for the input, so the label points at the right one. Needed as soon
   * as a page renders two of these — a date range, say — because the previous
   * hardcoded "DatePicker" made both labels address the same element.
   */
  id?: string;
}

function JalaliDayCalendar({
  date,
  setDate,
  title,
  disabled = false,
  id = "DatePicker",
}: CalendarProps) {
  const CustomInput = ({ openCalendar, value, handleValueChange }: any) => {
    return (
      <Input
        id={id}
        onFocus={openCalendar}
        value={value}
        onChange={handleValueChange}
        readOnly
      />
    );
  };
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="ml-2">
        {title}
      </Label>
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        value={date}
        onChange={(date) => {
          if (date) {
            setDate(date.toDate());
          } else {
            setDate(null);
          }
        }}
        render={<CustomInput />}
        format="YYYY/MM/DD"
        disabled={disabled}
      />
    </div>
  );
}

export default JalaliDayCalendar;
