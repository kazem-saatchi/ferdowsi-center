"use client";
import EmptyState from "@/components/EmptyState";

import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { ShopsTable } from "@/components/shop/ShopTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/store";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { labels } from "@/utils/label";
import { ShopType } from "@prisma/client";
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

  // Zustand State
  const { setShopsAll, shopsAll } = useStore(
    useShallow((state) => ({
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
    }))
  );

  useEffect(() => {
    if (!!data && !!data.data?.shops) {
      setShopsAll(data?.data?.shops);
    }
  }, [data]);

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

  const filteredShops = shopsAll?.filter((shop) => {
    if (shopFilter === undefined) return true;
    return shop.type === shopFilter;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.allShops}</CardTitle>
        <div className="flex flex-wrap items-center justify-start gap-2">
          {SHOP_FILTERS.map(({ type, label }) => (
            <Button
              key={label}
              variant={shopFilter === type ? "default" : "outline"}
              aria-pressed={shopFilter === type}
              onClick={() => setShopFilter(type)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filteredShops && filteredShops.length > 0 ? (
          <ShopsTable shops={filteredShops} />
        ) : (
          <EmptyState message={labels.noDataFound} />
        )}
      </CardContent>
    </Card>
  );
}
