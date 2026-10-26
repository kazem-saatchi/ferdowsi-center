"use client";
import EmptyState from "@/components/EmptyState";

import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import Pager from "@/components/Pager";
import ListToolbar from "@/components/table/ListToolbar";
import { ShopsTable } from "@/components/shop/ShopTable";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useClientList } from "@/hooks/useClientList";
import { useState } from "react";
import { labels } from "@/utils/label";
import { Shop, ShopType } from "@prisma/client";
import { Button } from "@/components/ui/button";

const SHOP_FILTERS: { type: ShopType | undefined; label: string }[] = [
  { type: undefined, label: labels.all },
  { type: ShopType.STORE, label: labels.shop },
  { type: ShopType.OFFICE, label: labels.office },
  { type: ShopType.KIOSK, label: labels.kiosk },
  { type: ShopType.PARKING, label: labels.parking },
  { type: ShopType.BOARD, label: labels.board },
];

export default function AllShopsPage() {
  const { data, isLoading, isError, error, refetch } = useFindAllShops();

  const [shopFilter, setShopFilter] = useState<ShopType | undefined>(undefined);

  const list = useClientList<Shop>(
    data?.data?.shops,
    (shop) => [shop.plaque, shop.ownerName, shop.renterName],
    (shop) => shopFilter === undefined || shop.type === shopFilter
  );

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message={error instanceof Error ? error.message : labels.somethingWentWrong}
        error={error}
        retry={refetch}
      />
    );
  }

  return (
    <div>
      <CardHeader className="p-3 sm:p-6 space-y-4">
        <CardTitle>{labels.allShops}</CardTitle>
        <ListToolbar
          query={list.query}
          onQueryChange={list.setQuery}
          placeholder={labels.searchShopsPlaceholder}
          pageSize={list.pageSize}
          onPageSizeChange={list.setPageSize}
          matchCount={list.matchCount}
        >
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={labels.type}
          >
            {SHOP_FILTERS.map(({ type, label }) => (
              <Button
                key={label}
                size="sm"
                variant={shopFilter === type ? "default" : "outline"}
                aria-pressed={shopFilter === type}
                onClick={() => {
                  setShopFilter(type);
                  list.resetPage();
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </ListToolbar>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        {list.pageItems.length > 0 ? (
          <>
            <ShopsTable shops={list.pageItems} />
            <Pager
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
            />
          </>
        ) : (
          <EmptyState message={labels.noDataFound} />
        )}
      </CardContent>
    </div>
  );
}
