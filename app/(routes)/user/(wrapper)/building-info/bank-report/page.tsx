"use client";

import React from "react";
import BankReportClient from "@/components/reports/BankReportClient";
import { Banknote } from "lucide-react";

export default function BankReportPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Banknote className="h-8 w-8 text-blue-600" />
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              گزارش بانکی
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              گزارش جامع تراکنش‌های بانکی درآمدها و هزینه‌ها
            </p>
          </div>
        </div>
      </div>

      {/* Client Component with Interactive Features */}
      <BankReportClient />
    </div>
  );
}
