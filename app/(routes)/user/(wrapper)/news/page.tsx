"use client";

import React from "react";
import { Newspaper } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewsPage() {

  return (
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>اخبار</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 text-center">
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="bg-muted p-4 rounded-full">
            <Newspaper className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
          </div>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground mb-2">
          این صفحه در حال ساخت می باشد
        </p>
        <p className="text-sm text-muted-foreground">
          لطفاً بعداً دوباره بازدید کنید
        </p>
      </CardContent>
    </div>
  );
}
