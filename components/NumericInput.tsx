import React from "react";
import { NumericFormat } from "react-number-format";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

function NumericInput({ value, onChange, label, disabled }: NumericInputProps) {
  return (
    <div className="flex flex-col w-full">
      <Label htmlFor="numericInput" className="text-sm text-gray-500">
        {label}
      </Label>
      <NumericFormat
        id="numericInput"
        name="numericInput"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/,/g, ""))}
        thousandSeparator
        customInput={Input}
        disabled={disabled}
      />
    </div>
  );
}

export default NumericInput;
