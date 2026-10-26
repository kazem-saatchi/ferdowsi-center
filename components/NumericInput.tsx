import React, { useId } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { formatNumericInput, parseNumericInput } from "@/utils/formatNumber";

interface NumericInputProps {
  /** Latin digits without separators, e.g. "1250000". */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  /** Thousands separators; off for identifiers such as a plaque or floor. */
  grouping?: boolean;
}

/** Number field that accepts Persian, Arabic or Latin digits, shows Persian
 *  digits with grouping, and hands back a plain Latin string. */
function NumericInput({
  value,
  onChange,
  label,
  id,
  name,
  disabled,
  required,
  allowDecimal = false,
  allowNegative = false,
  grouping = true,
}: NumericInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col w-full gap-2">
      {label && (
        <Label htmlFor={inputId} className="text-sm text-muted-foreground">
          {label}
        </Label>
      )}
      <Input
        id={inputId}
        name={name}
        type="text"
        // "numeric" keyboards on phones have no minus key.
        inputMode={allowNegative ? "text" : allowDecimal ? "decimal" : "numeric"}
        dir="ltr"
        className="text-right"
        value={formatNumericInput(value, grouping)}
        onChange={(event) =>
          onChange(
            parseNumericInput(event.target.value, {
              allowDecimal,
              allowNegative,
            })
          )
        }
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

export default NumericInput;
