import React from "react";
import { NumericFormat } from "react-number-format";
import { Input } from "./ui/input";

function NumericInput() {
  const [value, setValue] = React.useState("");
  return (
    <NumericFormat
      id="storeConst"
      name="storeConst"
      value={value}
      onChange={(event) => {
        setValue(event.target.value.replace(/,/g, ""));
      }}
      thousandSeparator
      customInput={Input}
      required
    />
  );
}

export default NumericInput;
