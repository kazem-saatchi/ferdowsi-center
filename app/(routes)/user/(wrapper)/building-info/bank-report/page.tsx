"use client";

import React from "react";
import BankReportClient from "@/components/reports/BankReportClient";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BankReportPage() {
  return (
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>گزارش بانکی</CardTitle>
        <CardDescription>
          گزارش جامع تراکنش‌های بانکی درآمدها و هزینه‌ها
        </CardDescription>
      </CardHeader>

      {/* Client Component with Interactive Features */}
      <BankReportClient />
    </div>
  );
}
