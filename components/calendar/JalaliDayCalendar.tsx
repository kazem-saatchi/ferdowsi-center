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
}

function JalaliDayCalendar({ date, setDate }: CalendarProps) {
  const CustomInput = ({ openCalendar, value, handleValueChange }: any) => {
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
        Owner Change Date
      </Label>
      <DatePicker
        id="DatePicker"
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
      />
    </div>
  );
}

export default JalaliDayCalendar;
