"use client";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Dispatch, SetStateAction } from "react";
import DateObject from "react-date-object";

interface CalendarProps {
  handleDateChange: (date: DateObject) => void;
  value?: DateObject | null;
}

function JalaliMonthCalendar({ handleDateChange, value }: CalendarProps) {
  const CustomInput = ({ value, openCalendar, handleValueChange }: any) => {
    return (
      <Input
        onFocus={openCalendar}
        value={value}
        onChange={handleValueChange}
        readOnly
      />
    );
  };
  return (
    <div className="space-y-2">
      <Label htmlFor="DatePicker" className="ml-2">
        ماه
      </Label>
      <DatePicker
        id="DatePicker"
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        onlyMonthPicker
        onChange={handleDateChange}
        value={value}
        render={<CustomInput />}
        format="MMMM YYYY"
      />
    </div>
  );
}

export default JalaliMonthCalendar;
