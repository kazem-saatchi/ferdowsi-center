"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Banknote, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BuildingInfoPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity font-medium touch-manipulation min-h-10"
        >
          <ChevronRight className="w-5 h-5 rotate-180 shrink-0" />
          بازگشت
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          اطلاعات ساختمان
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          مدیریت و مشاهده اطلاعات مالی و گزارش‌های ساختمان
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Bank Report Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary active:scale-[0.99] touch-manipulation"
          onClick={() => router.push("/user/building-info/bank-report")}
        >
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                <Banknote className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-right text-base sm:text-lg">
                گزارش بانکی
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-muted-foreground text-sm mb-4">
              مشاهده گزارش جامع تراکنش‌های بانکی شامل درآمدها و پرداخت‌ها به
              تفکیک دسته‌بندی
            </p>
            <div className="flex items-center gap-2 text-primary font-medium text-sm sm:text-base">
              <span>مشاهده گزارش</span>
              <ArrowLeft className="w-4 h-4 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <Card className="opacity-50 cursor-not-allowed border-2 border-dashed">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-3 rounded-lg shrink-0">
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-right text-muted-foreground text-base sm:text-lg">
                گزارش‌های بیشتر
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-muted-foreground text-sm">
              گزارش‌های بیشتر به زودی اضافه خواهند شد
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
