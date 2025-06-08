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
      <div className="container mx-auto p-4">
        <Card className="p-4 text-red-600">{error}</Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">جزئیات مالی واحد تجاری</h1>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ShopFinancialTable data={data} />
      )}
    </div>
  );
}