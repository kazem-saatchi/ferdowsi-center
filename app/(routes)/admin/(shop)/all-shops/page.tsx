"use client";

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
        message={error instanceof Error ? error.message : "Unknown error"}
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
        <div className="flex flex-row items-center justify-start gap-2">
          <Button variant="outline" onClick={() => setShopFilter(undefined)}>
            {labels.all}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShopFilter(ShopType.STORE)}
          >
            {labels.shop}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShopFilter(ShopType.OFFICE)}
          >
            {labels.office}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShopFilter(ShopType.KIOSK)}
          >
            {labels.kiosk}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShopFilter(ShopType.PARKING)}
          >
            {labels.parking}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShopFilter(ShopType.BOARD)}
          >
            {labels.board}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredShops && filteredShops.length > 0 ? (
          <ShopsTable shops={filteredShops} />
        ) : (
          <p>{labels.noDataFound}</p>
        )}
      </CardContent>
    </Card>
  );
}
