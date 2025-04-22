"use client";
import { Input } from "@/components/ui/input";
import React from "react";
import { NumericFormat } from "react-number-format";

function AdminDashboardPage() {
  const [value, setValue] = React.useState("");
  return (
    <div>
      AdminDashboardPage
      <NumericFormat
        value={value}
        onValueChange={({ value }) => setValue(value)}
        allowLeadingZeros
        thousandSeparator=","
      />
      <NumericFormat value={12323} customInput={Input} thousandSeparator />
    </div>
  );
}

export default AdminDashboardPage;
