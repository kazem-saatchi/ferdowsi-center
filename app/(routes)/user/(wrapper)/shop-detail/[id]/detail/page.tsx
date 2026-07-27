"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
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
    <div className="w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        جزئیات مالی واحد
      </h1>

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
    </div>
  );
}
