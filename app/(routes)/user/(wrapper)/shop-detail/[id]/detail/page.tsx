"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
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
    <Page>
      <PageHeader>
        <PageTitle>جزئیات مالی واحد</PageTitle>
      </PageHeader>
      <PageBody>
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
      </PageBody>
    </Page>
  );
}
