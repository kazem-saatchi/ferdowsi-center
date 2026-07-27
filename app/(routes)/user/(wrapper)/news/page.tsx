"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Newspaper } from "lucide-react";

export default function NewsPage() {
  const router = useRouter();

  return (
    <div className="w-full flex items-center justify-center py-4 sm:py-8">
      <div className="max-w-md w-full">
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

        {/* Main content */}
        <div className="bg-card rounded-2xl shadow-lg p-6 sm:p-8 text-center border border-border">
          {/* Icon */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="bg-muted p-4 rounded-full">
              <Newspaper className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            اخبار
          </h1>

          {/* Message */}
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            این صفحه در حال ساخت می باشد
          </p>

          {/* Decorative elements */}
          <div className="flex justify-center gap-2 mb-6 sm:mb-8">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-muted-foreground">
            لطفاً بعداً دوباره بازدید کنید
          </p>
        </div>
      </div>
    </div>
  );
}
