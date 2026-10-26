"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopFinancialTable } from "@/components/user/form/ShopFinancialTable";
import { useGetShopFinancialDetail } from "@/hooks/useGetShopFinancialDetail";

export default function ShopFinancialDetailPage() {
  const params = useParams();
  const shopId = params.id as string;
  const { data, loading, error } = useGetShopFinancialDetail(shopId);

  if (error) {
    return (
      <div className="w-full">
        <Card className="p-4 text-red-600 text-sm sm:text-base">{error}</Card>
      </div>
    );
  }

  return (
    <div>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>جزئیات مالی واحد</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            <Skeleton className="h-20 md:h-10 w-full" />
            <Skeleton className="h-20 md:h-10 w-full" />
            <Skeleton className="h-20 md:h-10 w-full" />
            <Skeleton className="h-20 md:h-10 w-full" />
          </div>
        ) : (
          <ShopFinancialTable data={data} />
        )}
      </CardContent>
    </div>
  );
}
