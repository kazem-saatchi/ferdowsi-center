"use client";

import React from "react";
import BankReportClient from "@/components/reports/BankReportClient";
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
} from "@/components/layout/Page";

export default function BankReportPage() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>گزارش بانکی</PageTitle>
        <PageDescription>
          گزارش جامع تراکنش‌های بانکی درآمدها و هزینه‌ها
        </PageDescription>
      </PageHeader>

      {/* Client Component with Interactive Features */}
      <BankReportClient />
    </Page>
  );
}
