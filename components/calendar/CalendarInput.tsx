"use client";

import { Input } from "../ui/input";

/** The text box react-multi-date-picker renders in place of its own. It lives
 *  at module level: declared inside a component it would be a new type on
 *  every render, so React would remount it and the field would lose focus.
 *  The picker injects openCalendar, value and handleValueChange. */
export default function CalendarInput({
  id,
  disabled,
  placeholder,
  openCalendar,
  value,
  handleValueChange,
}: {
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  openCalendar?: () => void;
  value?: string;
  handleValueChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <Input
      id={id}
      onFocus={openCalendar}
      onClick={openCalendar}
      value={value ?? ""}
      onChange={handleValueChange}
      disabled={disabled}
      placeholder={placeholder}
      readOnly
    />
  );
}
