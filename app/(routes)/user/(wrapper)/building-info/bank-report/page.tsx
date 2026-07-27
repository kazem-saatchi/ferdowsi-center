"use client";

import React from "react";
import BankReportClient from "@/components/reports/BankReportClient";
import { Banknote } from "lucide-react";

export default function BankReportPage() {
  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-start sm:items-center gap-3">
        <Banknote className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="text-right min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            گزارش بانکی
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            گزارش جامع تراکنش‌های بانکی درآمدها و هزینه‌ها
          </p>
        </div>
      </div>

      {/* Client Component with Interactive Features */}
      <BankReportClient />
    </div>
  );
}
